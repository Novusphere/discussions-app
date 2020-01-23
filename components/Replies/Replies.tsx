import * as React from 'react'
import { useCallback, useEffect, useMemo } from 'react'
import { discussions, Post } from '@novuspherejs'
import { getPermaLink, transformTipsToTransfers } from '@utils'
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
import { Observer, useObserver, useLocalStore } from 'mobx-react'
import { IStores } from '@stores'
import Router, { NextRouter } from 'next/router'
import { ObservableMap } from 'mobx'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ModalOptions } from '@globals'
import PostModel from '@models/postModel'
import copy from 'clipboard-copy'

interface IReplyProps {
    router: NextRouter
    supportedTokensImages: any
    hasAccount: boolean
    activePublicKey: string
    isFollowing: any
    currentHighlightedPostUuid: string
    highlightPostUuid: (uuid: string) => void
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
    showModal: (modal: string) => void
    hideModal: () => void
    clearWalletPrivateKey: () => void
    hasRenteredPassword: boolean
    temporaryWalletPrivateKey: string
}

// TODO: Implement blocked posts statuses
// TODO: Implement collapse
// TODO: Implement voting
const Reply: React.FC<IReplyProps> = ({
    reply,
    currentHighlightedPostUuid,
    highlightPostUuid,
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
    showModal,
    hideModal,
    clearWalletPrivateKey,
    hasRenteredPassword,
    temporaryWalletPrivateKey,
}) => {
    const replyStore = useLocalStore(
        source => ({
            replyContent: reply.content,
            replyModel: null,
            hover: false,
            collapsed: false,
            replyLoading: false,
            editing: false,

            get reply() {
                return source.reply
            },

            get permaLinkURL() {
                return getPermaLink(router.asPath.split('#')[0], replyStore.reply.uuid)
            },

            async copyAndScrollToPermalinkURL() {
                await copy(replyStore.permaLinkURL)
                await Router.push('/tag/[name]/[id]/[title]', replyStore.permaLinkURL, {
                    shallow: true,
                })

                highlightPostUuid(replyStore.reply.uuid)
            },

            setReplyContent(content) {
                replyStore.replyContent = content
            },
            setReplyModel(model) {
                replyStore.replyModel = model
            },
            setHover(status) {
                replyStore.hover = status
            },
            setCollapse(status) {
                replyStore.collapsed = status
            },
            setReplyLoading(status) {
                replyStore.replyLoading = status
            },
            setEditingLoading(status) {
                replyStore.editing = status
            },

            waitForUserInput(cb) {
                showModal(ModalOptions.walletActionPasswordReentry)

                const int = setInterval(() => {
                    if (source.temporaryWalletPrivateKey) {
                        clearInterval(int)
                        return cb(source.temporaryWalletPrivateKey)
                    }
                }, 200)
            },

            async submitEdit() {
                replyStore.setEditingLoading(true)
                try {
                    if (!source.hasAccount) {
                        showToast('You must be logged in to edit', 'error')
                        return
                    }

                    let editedReply: any = await replyStore.replyModel.saveEdits({
                        form: replyStore.replyModel.editForm.form,
                        postPriv: source.postPriv,
                        activePublicKey: source.activePublicKey,
                        posterType: source.posterType,
                        posterName: source.posterName,
                        activeUidWalletKey: source.activeUidWalletKey,
                        supportedTokensForUnifiedWallet: source.supportedTokensForUnifiedWallet,
                    })

                    const model = new PostModel(editedReply as any)
                    const signedReply = model.sign(source.postPriv)
                    const response = await discussions.post(signedReply as any)

                    return new Promise(resolve => {
                        const int = setInterval(async () => {
                            const submitted = await discussions.wasEditSubmitted(
                                reply.transaction,
                                response.uuid
                            )

                            if (submitted) {
                                clearInterval(int)

                                replyStore.reply.content = response.content
                                replyStore.reply.edit = true
                                replyStore.reply.editedAt = new Date(Date.now())
                                replyStore.reply.transaction = response.transaction
                                replyStore.reply.pub = response.pub

                                replyStore.setReplyContent(editedReply.content)
                                replyStore.setEditingLoading(false)
                                replyStore.replyModel.toggleEditing()

                                showToast('Your post has been edited', 'success')

                                return resolve(response)
                            }
                        }, 2000)
                    })
                } catch (error) {
                    replyStore.setEditingLoading(false)
                    showToast(error.message, 'error')
                }
            },

            async submitReply(parentReply: Post) {
                replyStore.setReplyLoading(true)
                try {
                    if (!source.hasAccount) {
                        showToast('You must be logged in to comment', 'error')
                        replyStore.setReplyLoading(false)
                        return
                    }
                    // submit reply and update the child replies
                    const reply = await replyStore.replyModel.submitReply({
                        postPriv: source.postPriv,
                        activePublicKey: source.activePublicKey,
                        posterType: source.posterType,
                        posterName: source.posterName,
                        activeUidWalletKey: source.activeUidWalletKey,
                        supportedTokensForUnifiedWallet: source.supportedTokensForUnifiedWallet,
                    })

                    if (reply.transfers) {
                        replyStore.waitForUserInput(async temporaryWalletPrivateKey => {
                            reply.transfers = transformTipsToTransfers(
                                reply.transfers,
                                parentReply.uidw,
                                temporaryWalletPrivateKey,
                                source.supportedTokensForUnifiedWallet
                            )

                            await replyStore.finishSubmittingReply(reply)
                        })
                    } else {
                        await replyStore.finishSubmittingReply(reply)
                        replyStore.setReplyLoading(false)
                    }
                } catch (error) {
                    replyStore.setReplyLoading(false)
                    showToast(error.message, 'error')
                }
            },

            async finishSubmittingReply(newReply: any) {
                try {
                    const model = new PostModel(newReply as any)
                    const signedReply = model.sign(source.postPriv)
                    const confirmedReply = await discussions.post(signedReply as any)

                    replyStore.reply.replies.push(confirmedReply)
                    replyStore.replyModel.clearReplyContent()
                    replyStore.replyModel.toggleOpen()

                    showToast('Your reply was successfully submitted', 'success')
                } catch (error) {
                    showToast(error.message, 'error')
                }
            },
        }),
        {
            reply,
            hasAccount,
            activePublicKey,
            isFollowing,
            postPriv,
            posterType,
            posterName,
            activeUidWalletKey,
            supportedTokensForUnifiedWallet,
            hasRenteredPassword,
            temporaryWalletPrivateKey,
        }
    )

    useEffect(() => {
        replyStore.setReplyModel(new NewReplyModel(reply))
    }, [])

    const handleVote = useCallback((...props) => {
        console.log(props)
    }, [])

    const hasReplyModelLoaded = useMemo(() => !!replyStore.replyModel, [replyStore.replyModel])

    const onMouseEnter = useCallback(() => {
        if (!replyStore.replyModel.editing) {
            replyStore.setHover(true)
        }
    }, [replyStore.replyModel])

    const onMouseLeave = useCallback(() => {
        if (!replyStore.replyModel.editing) {
            replyStore.setHover(false)
        }
    }, [replyStore.replyModel])

    const renderCollapseElements = useCallback(() => {
        if (replyStore.collapsed) {
            return (
                <span
                    className={'f6 pointer dim gray'}
                    onClick={() => replyStore.setCollapse(false)}
                    title={'Uncollapse comment'}
                >
                    [+]
                </span>
            )
        }
        return (
            <span
                className={'f6 pointer dim gray'}
                onClick={() => replyStore.setCollapse(true)}
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
                    pub={replyStore.reply.pub}
                    imageData={replyStore.reply.imageData}
                    name={replyStore.reply.displayName}
                />
                <span
                    className={'pl2 o-50 f6'}
                    title={moment(reply.edit ? reply.editedAt : reply.createdAt).format(
                        'YYYY-MM-DD HH:mm:ss'
                    )}
                >
                    {replyStore.reply.edit && 'edited '}{' '}
                    {moment(reply.edit ? reply.editedAt : reply.createdAt).fromNow()}
                </span>
                <Tips tokenImages={supportedTokensImages} tips={replyStore.reply.tips} />
            </>
        )
    }, [])

    const toggleFollowStatus = useCallback(() => {
        // return toggleFollowStatus(reply.displayName, reply.pub)
    }, [])

    const toggleToggleBlock = useCallback(() => {
        // return toggleFollowStatus(reply.displayName, reply.pub)
    }, [])

    const isMarkedAsSpam = useMemo(() => {
        return blockedPosts.has(replyStore.permaLinkURL)
    }, [])

    const setBlockedStatus = useCallback(() => {
        console.log('hey')
    }, [])

    const renderHoverElements = useCallback(
        isSticky => {
            if (!replyStore.hover || !hasReplyModelLoaded) {
                return null
            }

            return (
                <ReplyHoverElements
                    post={reply}
                    replyModel={replyStore.replyModel}
                    getPermaLinkUrl={replyStore.copyAndScrollToPermalinkURL}
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
        [replyStore.hover, hasReplyModelLoaded]
    )

    return useObserver(() => (
        <div
            id={replyStore.reply.uuid}
            data-post-uuid={replyStore.reply.uuid}
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
                                    {() => !replyStore.collapsed && renderHoverElements(isSticky)}
                                </Observer>
                            </div>
                        )
                    }}
                </Sticky>
                <div
                    style={{
                        height: !replyStore.collapsed ? 'auto' : '50px',
                    }}
                    className={classNames([
                        'parent flex flex-row pa2',
                        {
                            'post-content-hover': replyStore.hover,
                        },
                    ])}
                >
                    <div
                        style={{
                            visibility: replyStore.collapsed ? 'hidden' : 'visible',
                        }}
                        className={'flex flex-column justify-start items-center mr2'}
                    >
                        <VotingHandles
                            horizontal={false}
                            upVotes={replyStore.reply.upvotes}
                            downVotes={replyStore.reply.downvotes}
                            myVote={replyStore.reply.myVote}
                            uuid={replyStore.reply.uuid}
                            handler={handleVote}
                        />
                    </div>

                    <div className={'flex flex-column w-100'}>
                        <div className={'flex flex-row items-center header pb0'}>
                            <div className={'pr2'}>{renderCollapseElements()}</div>
                            {renderUserElements()}
                            <div className={'db'}>
                                {replyStore.collapsed && (
                                    <span className={'o-50 i f6 pl2 db'}>
                                        ({replyStore.reply.replies.length} children)
                                    </span>
                                )}
                            </div>
                        </div>

                        {replyStore.replyModel && replyStore.replyModel.editing && (
                            <>
                                <Form
                                    form={replyStore.replyModel.editForm}
                                    fieldClassName={'pb0'}
                                    hideSubmitButton
                                    className={'w-100 mt3'}
                                />

                                <div className={'flex flex-row items-center justify-start pb3'}>
                                    <button
                                        className={
                                            'f6 link dim ph3 pv2 dib mr1 pointer white bg-red'
                                        }
                                        onClick={replyStore.replyModel.toggleEditing}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={replyStore.editing}
                                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                        onClick={replyStore.submitEdit}
                                    >
                                        {replyStore.editing ? (
                                            <FontAwesomeIcon width={13} icon={faSpinner} spin />
                                        ) : (
                                            'Save Edit'
                                        )}
                                    </button>
                                </div>
                            </>
                        )}

                        {!replyStore.collapsed && (
                            <RichTextPreview
                                className={classNames([
                                    'f6 lh-copy reply-content mt2',
                                    {
                                        dn:
                                            replyStore.replyModel && replyStore.replyModel.editing
                                                ? 'hidden'
                                                : 'visible',
                                        dib:
                                            !replyStore.replyModel ||
                                            !replyStore.replyModel.editing,
                                    },
                                ])}
                            >
                                {replyStore.replyContent}
                            </RichTextPreview>
                        )}
                    </div>
                </div>
                {replyStore.replyModel && (
                    <ReplyBox
                        id={`${replyStore.reply.uuid}-reply`}
                        className={classNames([
                            'pl4 pr2 pb4',
                            {
                                'post-content-hover': replyStore.hover,
                            },
                        ])}
                        open={replyStore.replyModel.open}
                        uid={replyStore.reply.uuid}
                        onContentChange={replyStore.replyModel.setReplyContent}
                        value={replyStore.replyModel.replyContent}
                        loading={replyStore.replyLoading}
                        onSubmit={() => replyStore.submitReply(reply)}
                    />
                )}

                {!replyStore.collapsed &&
                    replyStore.reply.replies &&
                    replyStore.reply.replies.length > 0 &&
                    replyStore.reply.replies.map(nestedReply => (
                        <div
                            key={nestedReply.uuid}
                            onMouseLeave={() => replyStore.setHover(true)}
                            onMouseEnter={() => replyStore.setHover(false)}
                        >
                            <Reply
                                className={'ml3 child'}
                                router={router}
                                currentHighlightedPostUuid={currentHighlightedPostUuid}
                                highlightPostUuid={highlightPostUuid}
                                reply={nestedReply}
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
                                showModal={showModal}
                                hideModal={hideModal}
                                clearWalletPrivateKey={clearWalletPrivateKey}
                                hasRenteredPassword={hasRenteredPassword}
                                temporaryWalletPrivateKey={temporaryWalletPrivateKey}
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
    highlightPostUuid: (uuid: string) => void
    supportedTokensImages: any
    currentHighlightedPostUuid: string
    replies: Post[]
}

const Replies: React.FC<IRepliesProps> = ({
    authStore,
    userStore,
    replies,
    currentHighlightedPostUuid,
    highlightPostUuid,
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
                    showModal={uiStore.showModal}
                    hideModal={uiStore.hideModal}
                    currentHighlightedPostUuid={currentHighlightedPostUuid}
                    highlightPostUuid={highlightPostUuid}
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
                    clearWalletPrivateKey={authStore.clearWalletPrivateKey}
                    hasRenteredPassword={authStore.hasRenteredPassword}
                    temporaryWalletPrivateKey={authStore.temporaryWalletPrivateKey}
                />
            ))}
        </div>
    ))
}

export default Replies
