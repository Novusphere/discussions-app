import React, { FunctionComponent, useEffect, useState } from 'react'
import { Divider, Popover, Tooltip } from 'antd'
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
    Icons,
} from '@components'

interface IPostPreviewProps {
    post: Post
    hasAccount: boolean
    showToast: (m: string, d: string, type: string) => void
    postPriv: string

    tag: any
    blockedContentSetting: any
    blockedPosts: ObservableMap<string, string>
    blockedUsers: ObservableMap<string, string>
    blockedByDelegation: ObservableMap<string, string>
    unsignedPostsIsSpam: boolean
    toggleBlockPost: (url) => void
}

const PostPreview: FunctionComponent<IPostPreviewProps> = ({
    post,
    tag,
    blockedContentSetting,
    blockedPosts,
    blockedUsers,
    blockedByDelegation,
    unsignedPostsIsSpam,
    postPriv,
    showToast,
    toggleBlockPost,
    hasAccount,
}) => {
    const [url, setUrl] = useState('')

    useEffect(() => {
        async function getUrl() {
            let uuid = undefined

            if (!post.title) {
                uuid = post.uuid
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
                    opacity: shouldBeCollapsed ? 0.5 : 1,
                }}
            >
                <div className={'flex flex-auto'}>
                    <div
                        className={cx([
                            'bg-light-gray flex tc justify-center ph2 pv4 relative z-2 flex-auto',
                        ])}
                        style={{ width: '40px' }}
                    >
                        {shouldBeCollapsed
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
                                                        className={'db mr2'}
                                                        src={tag.logo}
                                                        title={`${tag.name} icon`}
                                                        width={25}
                                                    />
                                                )}
                                                <object className={'z-2'}>
                                                    <Link
                                                        href={'/tag/[name]'}
                                                        as={`/tag/${post.sub}`}
                                                        shallow={false}
                                                    >
                                                        <a className={'b ttu dim'}>#{post.sub}</a>
                                                    </Link>
                                                </object>
                                                <Divider type={'vertical'} />
                                                <UserNameWithIcon
                                                    imageData={post.imageData}
                                                    pub={post.pub}
                                                    name={post.displayName}
                                                />
                                                <Divider type={'vertical'} />
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

                                    <RichTextPreview className={'h4 gray'}>{post.content}</RichTextPreview>

                                    <object className={'z-2 absolute bottom-0 pv3'}>
                                        <Link
                                            href={'/tag/[name]/[id]/[title]'}
                                            as={`${url}#comments`}
                                        >
                                            <a className={'f6 mr2 black'}>
                                                <Icons.CommentIcon />
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
                                                className={'f6 mh2 black'}
                                                onClick={e => {
                                                    e.preventDefault()
                                                }}
                                            >
                                                share
                                            </a>
                                        </Popover>
                                        <Link href={'/tag/[name]/[id]/[title]'} as={`${url}#reply`}>
                                            <a className={'f6 mh2 black'}>reply</a>
                                        </Link>
                                        <a
                                            className={'f6 mh2 black'}
                                            onClick={e => {
                                                e.preventDefault()
                                                toggleBlockPost(url)
                                            }}
                                        >
                                            mark as spam
                                        </a>
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

PostPreview.defaultProps = {}

export default observer(PostPreview)
