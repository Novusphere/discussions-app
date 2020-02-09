import React, { FunctionComponent, useEffect, useState } from 'react'
import { Icon, Popover, Tooltip } from 'antd'
import Link from 'next/link'
import cx from 'classnames'
import styles from './PostPreview.module.scss'
import { observer, useLocalStore } from 'mobx-react-lite'
import { Post } from '@novuspherejs'
import { getThreadUrl, generateVoteObject, voteAsync } from '@utils'
import { ObservableMap } from 'mobx'
import moment from 'moment'
import {
    RichTextPreview,
    UserNameWithIcon,
    VotingHandles,
    Tips,
    SharePostPopover,
} from '@components'

interface IPostPreviewProps {
    loading?: boolean
    notificationUuid?: string
    post: Post
    hasAccount: boolean
    showToast: (m: string, d: string, type: string) => void
    postPriv: string

    tag: any
    tokenImages: any
    voteHandler?: (uuid: string, value: number) => Promise<void>
    disableVoteHandler?: boolean // in case voting needs to be disabled
    blockedContentSetting: any
    blockedPosts: ObservableMap<string, string>
    blockedUsers: ObservableMap<string, string>
    blockedByDelegation: ObservableMap<string, string>
    unsignedPostsIsSpam: boolean
    toggleBlockPost: (url) => void
}

const PostPreview: FunctionComponent<IPostPreviewProps> = ({
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
    toggleBlockPost,
    hasAccount,
    loading,
}) => {
    const [url, setUrl] = useState('')

    useEffect(() => {
        async function getUrl() {
            let uuid = undefined

            if (!post.title && notificationUuid) {
                uuid = notificationUuid
            }

            return await getThreadUrl(post, uuid)
        }

        let notDone = true

        getUrl().then(result => {
            if (notDone) {
                setUrl(result)
            }
        })

        return () => (notDone = false)
    }, [])

    const postStore = useLocalStore(
        source => ({
            myVote: post.myVote,
            downvotes: post.downvotes,
            upvotes: post.upvotes,

            get myVoteValue() {
                if (!source.hasAccount) return 0

                if (postStore.myVote && postStore.myVote.length) {
                    return postStore.myVote[0].value
                }

                return 0
            },

            async handleVote(e: any, uuid: string, value: number) {
                if (!source.hasAccount) {
                    return showToast('Failed', 'Please log in to vote', 'error')
                }

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
                        showToast('Failed', `Failed to ${type.split('s')[0]} this post`, 'error')
                    }
                } catch (error) {
                    showToast('Failed', error.message, 'error')
                }
            },
        }),
        {
            post,
            postPriv,
            hasAccount,
        }
    )
    const isSpam =
        blockedPosts.has(url) ||
        blockedUsers.has(post.pub) ||
        blockedByDelegation.has(url) ||
        blockedByDelegation.has(post.pub) ||
        (unsignedPostsIsSpam && !post.pub)

    const shouldBeHidden = blockedContentSetting === 'hidden' && isSpam
    const shouldBeCollapsed = blockedContentSetting === 'collapsed' && isSpam

    if (shouldBeHidden) {
        return null
    }

    return (
        <Link href={'/tag/[name]/[id]/[title]'} as={url}>
            <a
                className={cx([
                    styles.postPreview,
                    'db bg-white mh1',
                    {
                        [styles.pinnedPost]: post.pinned,
                    },
                ])}
                data-url={url}
                style={{
                    opacity: isSpam && blockedContentSetting === 'collapsed' ? 0.5 : 1,
                }}
            >
                <div className={'flex flex-auto'}>
                    <div
                        className={cx([
                            'bg-light-gray flex tc justify-center ph2 pv4 relative z-2 flex-auto',
                        ])}
                        style={{ width: '40px' }}
                    >
                        {disableVoteHandler || shouldBeCollapsed
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

                    <div className={'pa4 w-100'}>
                        <div className={'flex flex-column bg-white w-100'}>
                            {shouldBeCollapsed && (
                                <span className={'silver'}>This post was marked as spam.</span>
                            )}
                            {!shouldBeCollapsed && (
                                <>
                                    <div className={'db'}>
                                        {post.pinned && (
                                            <span
                                                className={
                                                    'f6 b red mb2 flex flex-row items-center'
                                                }
                                            >
                                                PINNED
                                            </span>
                                        )}
                                        <div
                                            className={
                                                'flex flex-row f6 lh-copy black items-center flex-wrap justify-between'
                                            }
                                        >
                                            <span className={'flex flex-row items-center'}>
                                                {tag && (
                                                    <img
                                                        src={tag.logo}
                                                        title={`${tag.name} icon`}
                                                        className={'mr2 db'}
                                                        width={25}
                                                    />
                                                )}
                                                <object className={'z-2'}>
                                                    <Link href={'/tag/[name]'} as={`/tag/${post.sub}`} shallow={false}>
                                                        <a className={'b ttu dim'}>#{post.sub}</a>
                                                    </Link>
                                                </object>
                                                <span className={'ph1 b'}>&#183;</span>
                                                <UserNameWithIcon
                                                    imageData={post.imageData}
                                                    pub={post.pub}
                                                    name={post.displayName}
                                                />
                                                <span className={'ph1 b'}>&#183;</span>
                                                <Tooltip
                                                    title={moment(post.createdAt)
                                                        .toDate()
                                                        .toLocaleString()}
                                                >
                                                    <span className={'light-silver'}>
                                                        {moment(post.createdAt).fromNow()}
                                                    </span>
                                                </Tooltip>
                                            </span>
                                            <Tips tips={post.tips} />
                                        </div>
                                    </div>

                                    <div className={'db pt1 mv2'}>
                                        <span className={'black f4 b lh-title'}>{post.title}</span>
                                    </div>

                                    <RichTextPreview>{post.content}</RichTextPreview>

                                    <object className={'z-2 absolute bottom-0 pv3'}>
                                        <Link
                                            href={'/tag/[name]/[id]/[title]'}
                                            as={`${url}#comments`}
                                        >
                                            <a className={'f6 mr2 dim pointer'}>
                                                <Icon
                                                    component={() => (
                                                        <svg
                                                            aria-hidden="true"
                                                            focusable="false"
                                                            data-prefix="fas"
                                                            data-icon="comment"
                                                            className="svg-inline--fa fa-comment fa-w-16 pr2"
                                                            role="img"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 512 512"
                                                            width="24"
                                                        >
                                                            <path
                                                                fill="currentColor"
                                                                d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32z"
                                                            ></path>
                                                        </svg>
                                                    )}
                                                />
                                                {post.totalReplies} comments
                                            </a>
                                        </Link>
                                        <Popover
                                            title={'Share this post'}
                                            content={<SharePostPopover url={url} />}
                                            placement={'bottom'}
                                        >
                                            <a
                                                href={'#'}
                                                className={'f6 mh2 dim pointer'}
                                                onClick={e => {
                                                    e.preventDefault()
                                                }}
                                            >
                                                share
                                            </a>
                                        </Popover>
                                        <Link href={'/tag/[name]/[id]/[title]'} as={`${url}#reply`}>
                                            <a className={'f6 mh2 dim pointer'}>reply</a>
                                        </Link>
                                        <span
                                            className={'f6 mh2 dim pointer'}
                                            onClick={e => {
                                                e.preventDefault()
                                                toggleBlockPost(url)
                                            }}
                                        >
                                            mark as spam
                                        </span>
                                    </object>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </a>
        </Link>
    )
}

PostPreview.defaultProps = {
    loading: false,
}

export default observer(PostPreview)
