import * as React from 'react'
import moment from 'moment'
import { RichTextPreview, Tips, UserNameWithIcon, VotingHandles } from '@components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import { TagModel } from '@models/tagModel'
import { observer, useLocalStore } from 'mobx-react'
import FeedModel from '@models/feedModel'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { generateVoteObject, getThreadUrl, voteAsync } from '@utils'
import { Post } from '@novuspherejs'
import { BlockedContentSetting } from '@stores/settingsStore'
import { ObservableMap } from 'mobx'

interface IPostPreviewProps {
    post: Post
    tag: TagModel
    tokenImages: any
    notificationUuid?: string
    voteHandler?: (uuid: string, value: number) => Promise<void>
    disableVoteHandler?: boolean // in case voting needs to be disabled
    blockedContentSetting: BlockedContentSetting
    blockedPosts: ObservableMap<string, string>
    blockedUsers: ObservableMap<string, string>
    blockedByDelegation: ObservableMap<string, string>
    unsignedPostsIsSpam: boolean
    postPriv: string
    showToast: (m: string, t: string) => void
}

const PostPreview: React.FC<IPostPreviewProps> = ({
    disableVoteHandler,
    post,
    tag,
    tokenImages,
    notificationUuid,
    voteHandler,
    blockedContentSetting,
    blockedPosts,
    blockedUsers,
    blockedByDelegation,
    unsignedPostsIsSpam,
    postPriv,
    showToast,
}) => {
    const [url, setUrl] = useState('')

    const postStore = useLocalStore(
        source => ({
            myVote: post.myVote,
            downvotes: post.downvotes,
            upvotes: post.upvotes,

            get myVoteValue() {
                if (postStore.myVote && postStore.myVote.length) {
                    return postStore.myVote[0].value
                }

                return 0
            },

            async handleVote(e: any, uuid: string, value: number) {
                let type

                switch (value) {
                    case 1:
                        type = 'upvote'
                        break
                    case -1:
                        type = 'downvote'
                        break
                }

                try {
                    const myVoteValue = postStore.myVoteValue

                    // check if your prev vote was positive
                    if (myVoteValue === 1) {
                        // what type of vote are you doing
                        if (type === 'downvote') {
                            postStore.upvotes -= 1
                            postStore.downvotes += 1
                            postStore.myVote = [{ value: -1 }]
                        }

                        if (type === 'upvote') {
                            postStore.upvotes -= 1
                            postStore.myVote = [{ value: 0 }]
                        }
                    }

                    // check if your prev vote was negative
                    if (myVoteValue === -1) {
                        // what type of vote are you doing
                        if (type === 'downvote') {
                            postStore.upvotes += 1
                            postStore.myVote = [{ value: 0 }]
                        }

                        if (type === 'upvote') {
                            postStore.upvotes += 1
                            postStore.downvotes -= 1
                            postStore.myVote = [{ value: 1 }]
                        }
                    }

                    // you never voted
                    if (myVoteValue === 0) {
                        if (type === 'downvote') {
                            postStore.downvotes += 1
                            postStore.myVote = [{ value: -1 }]
                        }
                        //
                        if (type === 'upvote') {
                            postStore.upvotes += 1
                            postStore.myVote = [{ value: 1 }]
                        }
                    }

                    const voteObject = generateVoteObject({
                        uuid,
                        postPriv: source.postPriv,
                        value: postStore.myVoteValue,
                    })

                    const data = await voteAsync({
                        voter: '',
                        uuid,
                        value: postStore.myVoteValue,
                        nonce: voteObject.nonce,
                        pub: voteObject.pub,
                        sig: voteObject.sig,
                    })

                    if (data.error) {
                        showToast(`Failed to ${type.split('s')[0]} this post`, 'error')
                    }
                } catch (error) {
                    showToast(error.message, 'error')
                }
            },
        }),
        {
            post,
            postPriv,
        }
    )

    useEffect(() => {
        // function makePostIntoFeedModel() {
        //     setPostModel(new FeedModel(post))
        // }

        async function getUrl() {
            let uuid = undefined

            if (!post.title && notificationUuid) {
                uuid = notificationUuid
            }

            setUrl(await getThreadUrl(post, uuid))
        }

        // makePostIntoFeedModel()
        getUrl()
    }, [])

    const isSpam =
        blockedPosts.has(url) ||
        blockedUsers.has(post.pub) ||
        blockedByDelegation.has(url) ||
        blockedByDelegation.has(post.pub) ||
        (unsignedPostsIsSpam && !post.pub)

    const shouldBeCollapsed = blockedContentSetting === 'collapsed' && isSpam
    const shouldBeHidden = isSpam && blockedContentSetting === 'hidden'

    if (shouldBeHidden) {
        return null
    }

    return (
        <Link href={'/tag/[name]/[id]/[title]'} as={url} passHref={true}>
            <a
                className={'post-preview'}
                data-url={url}
                style={{
                    opacity: isSpam && blockedContentSetting === 'collapsed' ? 0.5 : 1,
                }}
            >
                <div className={'flex flex-auto'}>
                    <div
                        className={
                            'bg-light-gray flex tc justify-center ph2 pv4 relative z-2 flex-auto'
                        }
                        style={{ width: '40px' }}
                    >
                        {disableVoteHandler || isSpam
                            ? null
                            : post && (
                                  <VotingHandles
                                      upVotes={postStore.upvotes}
                                      downVotes={postStore.downvotes}
                                      myVote={postStore.myVoteValue}
                                      uuid={post.uuid}
                                      handler={postStore.handleVote}
                                  />
                              )}
                    </div>

                    <span className={'no-style w-100'}>
                        <div className={'flex flex-column post-content w-100'}>
                            {shouldBeCollapsed && (
                                <span className={'silver'}>This post was marked as spam.</span>
                            )}
                            {!shouldBeCollapsed && (
                                <>
                                    <div className={'db'}>
                                        <div
                                            className={
                                                'flex f6 lh-copy black items-center flex-wrap'
                                            }
                                        >
                                            {tag && (
                                                <img
                                                    src={tag.icon}
                                                    title={`${tag.name} icon`}
                                                    className={'tag-image'}
                                                />
                                            )}
                                            <span className={'b ttu'}>{post.sub}</span>
                                            <span className={'ph1 b'}>&#183;</span>
                                            <UserNameWithIcon
                                                imageData={post.imageData}
                                                pub={post.pub}
                                                name={post.displayName}
                                                imageSize={20}
                                            />
                                            <span className={'ph1 b'}>&#183;</span>
                                            <span
                                                className={'o-50'}
                                                title={moment(post.createdAt)
                                                    .toDate()
                                                    .toLocaleString()}
                                            >
                                                {moment(post.createdAt).fromNow()}
                                            </span>
                                            <Tips tokenImages={tokenImages} tips={post.tips} />
                                        </div>
                                    </div>

                                    <div className={'db pt1 mv2'}>
                                        <span className={'black f3 b lh-title'}>{post.title}</span>
                                    </div>

                                    <RichTextPreview>{post.content}</RichTextPreview>

                                    <div className={'flex z-2 footer b'}>
                                        <object>
                                            <Link
                                                href={'/tag/[name]/[id]/[title]'}
                                                as={`${url}#comments`}
                                            >
                                                <a className={'o-80 f6 ml2 dim pointer'}>
                                                    <FontAwesomeIcon
                                                        width={13}
                                                        icon={faComment}
                                                        className={'pr2'}
                                                    />
                                                    {post.totalReplies} comments
                                                </a>
                                            </Link>
                                        </object>
                                        <span className={'o-80 f6 ml2 dim pointer'}>share</span>
                                        <span className={'o-80 f6 ml2 dim pointer'}>reply</span>
                                        <span className={'o-80 f6 ml2 dim pointer'}>
                                            mark as spam
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </span>
                </div>
            </a>
        </Link>
    )
}

export default observer(PostPreview)
