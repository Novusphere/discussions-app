import * as React from 'react'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { Post } from '@novuspherejs'
import { getPermaLink } from '@utils'
import classNames from 'classnames'
import {
    ReplyHoverElements,
    RichTextPreview,
    Tips,
    UserNameWithIcon,
    VotingHandles,
} from '../index'
import { NewReplyModel } from '@models/newReplyModel'
import moment from 'moment'
import { Sticky, StickyContainer } from 'react-sticky'
import { Observer, useObserver } from 'mobx-react'
import { getAuthStore, getUserStore, IStores } from '@stores'
import { NextRouter } from 'next/router'
import { ObservableMap } from 'mobx'

interface IReplyProps {
    router: NextRouter
    supportedTokensImages: any
    hasAccount: boolean
    activePublicKey: string
    isFollowing: any
    currentHighlightedPostUuid: string
    reply: Post
    blockedPosts: ObservableMap<string, string>
    toggleFollowStatus: (user, pub) => void
    className?: string
}

// TODO: Implement blocked posts statuses
// TODO: Implement collapse
// TODO: Implement voting
const Reply: React.FC<IReplyProps> = ({
    reply,
    currentHighlightedPostUuid,
    supportedTokensImages,
    blockedPosts,
    router,
    hasAccount,
    activePublicKey,
    isFollowing,
    className,
}) => {
    const [replyModel, setReplyModel] = useState<NewReplyModel>(null)
    const [hover, setHover] = useState(false)
    const [collapsed, setCollapse] = useState(false)

    useLayoutEffect(() => {
        setReplyModel(new NewReplyModel(reply))
    }, [])

    const handleVote = useCallback((...props) => {
        console.log(props)
    }, [])

    const hasReplyModelLoaded = useMemo(() => !!replyModel, [replyModel])

    const onMouseEnter = useCallback(() => {
        if (!replyModel.editing) {
            setHover(true)
        }
    }, [replyModel])

    const onMouseLeave = useCallback(() => {
        if (!replyModel.editing) {
            setHover(false)
        }
    }, [replyModel])

    const renderCollapseElements = useCallback(() => {
        if (collapsed) {
            return (
                <span
                    className={'f6 pointer dim gray'}
                    onClick={() => setCollapse(false)}
                    title={'Uncollapse comment'}
                >
                    [+]
                </span>
            )
        }
        return (
            <span
                className={'f6 pointer dim gray'}
                onClick={() => setCollapse(true)}
                title={'Collapse comment'}
            >
                [-]
            </span>
        )
    }, [])

    const renderUserElements = useCallback(() => {
        return (
            <>
                <UserNameWithIcon
                    pub={reply.pub}
                    imageData={reply.imageData}
                    name={reply.displayName}
                />
                <span
                    className={'pl2 o-50 f6'}
                    title={moment(reply.edit ? reply.editedAt : reply.createdAt).format(
                        'YYYY-MM-DD HH:mm:ss'
                    )}
                >
                    {reply.edit && 'edited '}{' '}
                    {moment(reply.edit ? reply.editedAt : reply.createdAt).fromNow()}
                </span>
                <Tips tokenImages={supportedTokensImages} tips={reply.tips} />
            </>
        )
    }, [])

    const getPermaLinkUrl = useCallback(() => {
        return getPermaLink(router.asPath.split('#')[0], reply.uuid)
    }, [])

    const toggleFollowStatus = useCallback(() => {
        // return toggleFollowStatus(reply.displayName, reply.pub)
    }, [])

    const toggleToggleBlock = useCallback(() => {
        // return toggleFollowStatus(reply.displayName, reply.pub)
    }, [])

    const isMarkedAsSpam = useMemo(() => {
        return blockedPosts.has(getPermaLinkUrl())
    }, [])

    const setBlockedStatus = useCallback(() => {
        console.log('hey')
    }, [])

    const renderHoverElements = useCallback(
        isSticky => {
            if (!hover || !hasReplyModelLoaded) {
                return null
            }

            return (
                <ReplyHoverElements
                    post={reply}
                    replyModel={replyModel}
                    getPermaLinkUrl={getPermaLinkUrl}
                    toggleFollowStatus={toggleFollowStatus}
                    toggleToggleBlock={toggleToggleBlock}
                    hasAccount={hasAccount}
                    activePublicKey={activePublicKey}
                    isFollowing={isFollowing(reply.pub)}
                    isMarkedAsSpam={isMarkedAsSpam}
                    isSticky={isSticky}
                    onMarkSpamComplete={setBlockedStatus} // TODO: Implement me
                />
            )
        },
        [hover, hasReplyModelLoaded]
    )

    return (
        <div
            id={reply.uuid}
            data-post-uuid={reply.uuid}
            className={classNames([
                'post-reply black mb2 w-100',
                {
                    [className]: !!className,
                    'permalink-highlight': currentHighlightedPostUuid === reply.uuid,
                },
            ])}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <StickyContainer>
                <Sticky>
                    {({ style, isSticky }) => {
                        return (
                            <div
                                style={{
                                    ...style,
                                    top: 55,
                                    zIndex: 9999,
                                }}
                            >
                                <Observer>
                                    {() => !collapsed && renderHoverElements(isSticky)}
                                </Observer>
                            </div>
                        )
                    }}
                </Sticky>
                <div
                    className={classNames([
                        'parent flex flex-row pa2 w-100',
                        {
                            'post-content-hover': hover,
                        },
                    ])}
                >
                    <div
                        style={{
                            visibility: collapsed ? 'hidden' : 'visible',
                        }}
                        className={'flex flex-column justify-start items-center mr2'}
                    >
                        <VotingHandles
                            horizontal={false}
                            upVotes={reply.upvotes}
                            downVotes={reply.downvotes}
                            myVote={reply.myVote}
                            uuid={reply.uuid}
                            handler={handleVote}
                        />
                    </div>

                    <div className={'flex flex-column'}>
                        <div className={'flex flex-row items-center header pb0'}>
                            <div className={'pr2'}>{renderCollapseElements()}</div>
                            {renderUserElements()}
                            <div className={'db'}>
                                {collapsed && (
                                    <span className={'o-50 i f6 pl2 db'}>
                                        ({reply.replies.length} children)
                                    </span>
                                )}
                            </div>
                        </div>

                        {!collapsed && (
                            <RichTextPreview
                                className={classNames([
                                    'f6 lh-copy reply-content mt2',
                                    {
                                        hidden: replyModel && replyModel.editing,
                                        visible: !hasReplyModelLoaded || !replyModel.editing,
                                    },
                                ])}
                            >
                                {reply.content}
                            </RichTextPreview>
                        )}

                        {!collapsed &&
                            reply.replies.map(reply => (
                                <div
                                    key={reply.uuid}
                                    onMouseLeave={() => setHover(true)}
                                    onMouseEnter={() => setHover(false)}
                                >
                                    <Reply
                                        className={'ml3 child'}
                                        router={router}
                                        currentHighlightedPostUuid={currentHighlightedPostUuid}
                                        reply={reply}
                                        supportedTokensImages={supportedTokensImages}
                                        toggleFollowStatus={toggleFollowStatus}
                                        blockedPosts={blockedPosts}
                                        isFollowing={isFollowing}
                                        activePublicKey={activePublicKey}
                                        hasAccount={hasAccount}
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            </StickyContainer>
        </div>
    )
}

interface IRepliesProps {
    authStore: IStores['authStore']
    userStore: IStores['userStore']
    router: NextRouter
    supportedTokensImages: any
    currentHighlightedPostUuid: string
    replies: Post[]
}

const Replies: React.FC<IRepliesProps> = ({
    authStore,
    userStore,
    replies,
    currentHighlightedPostUuid,
    supportedTokensImages,
    router,
}) => {
    return useObserver(() => (
        <div className={'card'}>
            {replies.map(reply => (
                <Reply
                    router={router}
                    key={reply.uuid}
                    reply={reply}
                    currentHighlightedPostUuid={currentHighlightedPostUuid}
                    supportedTokensImages={supportedTokensImages}
                    toggleFollowStatus={userStore.toggleUserFollowing}
                    blockedPosts={userStore.blockedPosts}
                    isFollowing={userStore.isFollowingUser}
                    hasAccount={authStore.hasAccount}
                    activePublicKey={authStore.activePublicKey}
                />
            ))}
        </div>
    ))
}

export default Replies
