import * as React from 'react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Post } from '@novuspherejs'
import { getPermaLink } from '@utils'
import classNames from 'classnames'
import {
    Form,
    ReplyBox,
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
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { task } from 'mobx-task'

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
    postPriv: string
    posterType: string
    posterName: string
    activeUidWalletKey: string
    supportedTokensForUnifiedWallet: any[]
    showToast: (m: string, t: string) => void
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
    postPriv,
    posterType,
    posterName,
    activeUidWalletKey,
    supportedTokensForUnifiedWallet,
    showToast,
}) => {
    const [replyContent, setReplyContent] = useState(reply.content)
    const [replyModel, setReplyModel] = useState<NewReplyModel>(null)
    const [hover, setHover] = useState(false)
    const [collapsed, setCollapse] = useState(false)

    useEffect(() => {
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

    const onReplySubmit = useCallback(async () => {
        try {
            if (!hasAccount) {
                showToast('You must be logged in to comment', 'error')
                return
            }
            // submit reply and update the child replies
            const reply = await replyModel.submitReply()
        } catch (error) {
            showToast(error.message, 'error')
        }
    }, [replyModel, hasAccount])

    const onEditSave = useCallback(async () => {
        try {
            if (!hasAccount) {
                showToast('You must be logged in to edit', 'error')
                return
            }
            const editedContent = await replyModel.saveEdits(replyModel.editForm.form)
            console.log(editedContent)
            setReplyContent(editedContent)
        } catch (error) {
            showToast(error.message, 'error')
        }
    }, [replyModel, hasAccount])

    return useObserver(() => (
        <div
            id={reply.uuid}
            data-post-uuid={reply.uuid}
            className={classNames([
                'post-reply black mb2',
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
                    style={{
                        height: !collapsed ? 'auto' : '50px',
                    }}
                    className={classNames([
                        'parent flex flex-row pa2',
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

                    <div className={'flex flex-column w-100'}>
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

                        {replyModel && replyModel.editing && (
                            <>
                                <Form
                                    form={replyModel.editForm}
                                    fieldClassName={'pb0'}
                                    hideSubmitButton
                                    className={'w-100 mt3'}
                                />

                                <div className={'flex flex-row items-center justify-start pb3'}>
                                    <button
                                        className={
                                            'f6 link dim ph3 pv2 dib mr1 pointer white bg-red'
                                        }
                                        onClick={replyModel.toggleEditing}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={replyModel.saveEdits['pending']}
                                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                        onClick={onEditSave}
                                    >
                                        {replyModel.saveEdits['pending'] ? (
                                            <FontAwesomeIcon width={13} icon={faSpinner} spin />
                                        ) : (
                                            'Save Edit'
                                        )}
                                    </button>
                                </div>
                            </>
                        )}

                        {!collapsed && (
                            <RichTextPreview
                                className={classNames([
                                    'f6 lh-copy reply-content mt2',
                                    {
                                        dn: replyModel && replyModel.editing ? 'hidden' : 'visible',
                                        dib: !replyModel || !replyModel.editing,
                                    },
                                ])}
                            >
                                {replyContent}
                            </RichTextPreview>
                        )}
                    </div>
                </div>
                {replyModel && (
                    <ReplyBox
                        id={`${reply.uuid}-reply`}
                        className={classNames([
                            'pl4 pr2 pb4',
                            {
                                'post-content-hover': hover,
                            },
                        ])}
                        open={replyModel.open}
                        uid={reply.uuid}
                        onContentChange={replyModel.setReplyContent}
                        value={replyModel.replyContent}
                        loading={replyModel.submitReply['pending']}
                        onSubmit={onReplySubmit}
                    />
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
                                postPriv={postPriv}
                                posterType={posterType}
                                posterName={posterName}
                                activeUidWalletKey={activeUidWalletKey}
                                supportedTokensForUnifiedWallet={supportedTokensForUnifiedWallet}
                                showToast={showToast}
                            />
                        </div>
                    ))}
            </StickyContainer>
        </div>
    ))
}

interface IRepliesProps {
    authStore: IStores['authStore']
    userStore: IStores['userStore']
    uiStore: IStores['uiStore']
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
    uiStore,
}) => {
    return useObserver(() => (
        <div className={'card'}>
            {replies.map(reply => (
                <Reply
                    router={router}
                    key={reply.uuid}
                    reply={reply}
                    showToast={uiStore.showToast}
                    currentHighlightedPostUuid={currentHighlightedPostUuid}
                    supportedTokensImages={supportedTokensImages}
                    toggleFollowStatus={userStore.toggleUserFollowing}
                    blockedPosts={userStore.blockedPosts}
                    isFollowing={userStore.isFollowingUser}
                    hasAccount={authStore.hasAccount}
                    activePublicKey={authStore.activePublicKey}
                    postPriv={authStore.postPriv}
                    posterType={authStore.posterType}
                    posterName={authStore.posterName}
                    activeUidWalletKey={authStore.activeUidWalletKey}
                    supportedTokensForUnifiedWallet={authStore.supportedTokensForUnifiedWallet}
                />
            ))}
        </div>
    ))
}

export default Replies
