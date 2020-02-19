import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { Divider, Popover, Tooltip } from 'antd'
import cx from 'classnames'
import styles from './PostPreview.module.scss'
import { observer, useLocalStore } from 'mobx-react-lite'
import { Post } from '@novuspherejs'
import { getThreadUrl, generateVoteObject, voteAsync, Desktop, Mobile } from '@utils'
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
import { Link } from 'react-router-dom';

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
    toggleBlockPost: (url: string) => void
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

    const postIcon = useCallback((size = 25) => {
        if (!tag) return null
        return <img className={'db mr2'} src={tag.logo} title={`${tag.name} icon`} width={size} />
    }, [])

    const postSub = useCallback(
        () => (
            <object className={'z-2'}>
                <Link to={`/tag/${post.sub}`}>
                    <a className={'b ttu dim'}>#{post.sub}</a>
                </Link>
            </object>
        ),
        []
    )

    const postUsername = useCallback(
        () => (
            <UserNameWithIcon imageData={post.imageData} pub={post.pub} name={post.displayName} />
        ),
        []
    )

    const postDate = useCallback(
        () => (
            <Tooltip
                title={moment(post.createdAt)
                    .toDate()
                    .toLocaleString()}
            >
                <span className={'light-silver'}>{moment(post.createdAt).fromNow()}</span>
            </Tooltip>
        ),
        []
    )

    const postTips = useCallback(() => <Tips tips={post.tips} />, [])

    const postMetaData = useCallback(
        () => (
            <div
                className={'flex flex-row f6 lh-copy black items-center flex-wrap justify-between'}
            >
                <span className={'flex flex-row items-center'}>
                    {postIcon()}
                    {postSub()}
                    <Divider type={'vertical'} />
                    {postUsername()}
                    <Divider type={'vertical'} />
                    {postDate()}
                </span>
                {postTips()}
            </div>
        ),
        []
    )

    const postTotalReplies = useCallback(
        () => (
            <Link to={`${url}#comments`}>
                <a className={'mr2 black'}>
                    <Icons.CommentIcon />
                    {post.totalReplies} comments
                </a>
            </Link>
        ),
        []
    )

    const postActions = useCallback(
        () => (
            <>
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
                <Link to={`${url}#reply`}>
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
            </>
        ),
        []
    )

    const renderVotingHandles = (horizontal = false, props = {}) => {
        return shouldBeCollapsed
            ? null
            : post && (
                  <VotingHandles
                      horizontal={horizontal}
                      upVotes={postStore.upvotes}
                      downVotes={postStore.downvotes}
                      myVote={postStore.myVoteValue}
                      uuid={post.uuid}
                      handler={postStore.handleVote}
                      {...props}
                  />
              )
    }

    return (
        <Link to={url}>
            <a
                className={cx([
                    styles.postPreview,
                    'db bg-white mb0 mb2-ns w-100',
                    {
                        [styles.pinnedPost]: post.pinned,
                    },
                ])}
                data-url={url}
                style={{
                    opacity: shouldBeCollapsed ? 0.5 : 1,
                }}
            >
                <div className={'flex flex-row'}>
                    <div
                        className={
                            'bg-light-gray w2 ph2 pv4 z-2'
                        }
                    >
                        {renderVotingHandles()}
                    </div>
                    <div className={'flex flex-column bg-white pa2 pa4-ns'}>
                        {shouldBeCollapsed && (
                            <span className={'silver'}>This post was marked as spam.</span>
                        )}
                        {!shouldBeCollapsed && (
                            <>
                                {post.pinned && (
                                    <span className={'db f6 b red mb2 flex flex-row items-center'}>
                                        PINNED
                                    </span>
                                )}

                                <Desktop>
                                    {postMetaData()}
                                    <div className={'db pt1 mv2'}>
                                        <span className={'black f6 f4-ns b lh-title'}>
                                            {post.title}
                                        </span>
                                    </div>
                                    <object>
                                        <RichTextPreview className={'h4 gray'}>
                                            {post.content}
                                        </RichTextPreview>
                                    </object>

                                    <object className={'z-2 absolute bottom-0 pv3'}>
                                        {postTotalReplies()}
                                        {postActions()}
                                    </object>
                                </Desktop>

                                <Mobile>
                                    <div className={'relative overflow-hidden'}>
                                        <div
                                            className={
                                                'w-20 fl flex items-center justify-center pt3'
                                            }
                                        >
                                            {postIcon(50)}
                                        </div>
                                        <div className={'w-80 fl'}>
                                            <div className={'f7 flex flex-row items-center mb2'}>
                                                {postUsername()}
                                                <span className={'ph2'}>{postDate()}</span>
                                            </div>
                                            <span className={'black f6 f4-ns b lh-title'}>
                                                {post.title}
                                            </span>

                                            {/*<RichTextPreview className={'h3 gray mb3'}>*/}
                                            {/*    {post.content}*/}
                                            {/*</RichTextPreview>*/}

                                            <div
                                                className={
                                                    'mt2 w-100 left-0 bottom-0 z-2 db f7 flex flex-row items-center mb2'
                                                }
                                            >
                                                {renderVotingHandles(true, { className: 'f7' })}
                                                <div className={'o-30 ml2'}>
                                                    {postTotalReplies()}
                                                </div>
                                                {postTips()}
                                            </div>
                                        </div>
                                        <Divider style={{ margin: 0, padding: 0 }} />
                                    </div>
                                </Mobile>
                            </>
                        )}
                    </div>
                </div>
            </a>
        </Link>
    )
}

PostPreview.defaultProps = {}

export default observer(PostPreview)
