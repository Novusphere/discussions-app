import * as React from 'react'
import { useCallback, useEffect, useMemo } from 'react'
import { discussions, Post, Thread } from '@novuspherejs'
import { generateVoteObject, getPermaLink, transformTipsToTransfers, voteAsync } from '@utils'
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
import { Observer, useLocalStore, observer } from 'mobx-react'
import { IStores } from '@stores'
import Router, { NextRouter } from 'next/router'
import { ObservableMap } from 'mobx'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ModalOptions } from '@globals'
import PostModel from '@models/postModel'
import copy from 'clipboard-copy'
import { BlockedContentSetting } from '@stores/settingsStore'
import { useComputed } from 'mobx-react-lite'

interface IReplyProps {
    router: NextRouter
    supportedTokensImages: any
    hasAccount: boolean
    activePublicKey: string
    isFollowing: any
    currentHighlightedPostUuid: string
    highlightPostUuid: (uuid: string) => void
    reply: Post
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
    toggleFollowStatus: (user: string, pub: string) => void
    toggleBlockPost: (permalink: string) => void

    isCollapsed?: boolean
    unsignedPostsIsSpam: boolean
    blockedContentSetting: BlockedContentSetting
    blockedPosts: ObservableMap<string, string>
    blockedUsers: ObservableMap<string, string>
    blockedByDelegation: ObservableMap<string, string>
}

const Reply: React.FC<IReplyProps> = observer(
    ({
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
        toggleFollowStatus,
        toggleBlockPost,

        unsignedPostsIsSpam,
        blockedContentSetting,
        blockedByDelegation,
        blockedUsers,
    }) => {
        const replyStore = useLocalStore(
            source => ({
                replyContent: reply.content,
                replyModel: null,
                hover: false,
                collapsed: false,
                replyLoading: false,
                editing: false,
                hidden: false,

                myVote: reply.myVote,
                downvotes: reply.downvotes,
                upvotes: reply.upvotes,

                get reply() {
                    return source.reply
                },

                get supportedTokensImages() {
                    return source.supportedTokensImages
                },

                get myVoteValue() {
                    if (replyStore.myVote && replyStore.myVote.length) {
                        return replyStore.myVote[0].value
                    }

                    return 0
                },

                get spam() {
                    let isBlockedByDelegation =
                        source.blockedByDelegation.has(replyStore.permaLinkURL) ||
                        source.blockedByDelegation.has(source.reply.pub)

                    return (
                        source.blockedPosts.has(replyStore.permaLinkURL) ||
                        source.blockedUsers.has(source.reply.pub) ||
                        isBlockedByDelegation ||
                        (source.unsignedPostsIsSpam && !source.reply.pub)
                    )
                },

                get isMarkedAsSpam() {
                    return source.blockedPosts.has(replyStore.permaLinkURL)
                },

                get permaLinkURL() {
                    return getPermaLink(router.asPath.split('#')[0], reply.uuid)
                },

                refreshVote() {
                    replyStore.myVote = source.reply.myVote
                },

                async copyAndScrollToPermalinkURL() {
                    const url = `${window.location.origin}${replyStore.permaLinkURL}`
                    await copy(url)
                    await Router.push('/tag/[name]/[id]/[title]', url, {
                        shallow: true,
                    })

                    highlightPostUuid(reply.uuid)
                },

                setBlockedStatus() {
                    if (replyStore.spam) {
                        replyStore.collapsed = source.blockedContentSetting === 'collapsed'
                        replyStore.hidden = source.blockedContentSetting === 'hidden'
                    }
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

                toggleFollowStatus() {
                    toggleFollowStatus(reply.displayName, reply.pub)
                },

                toggleBlockPost() {
                    toggleBlockPost(replyStore.permaLinkURL)
                    replyStore.setBlockedStatus()
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
                        const myVoteValue = replyStore.myVoteValue

                        // check if your prev vote was positive
                        if (myVoteValue === 1) {
                            // what type of vote are you doing
                            if (type === 'downvote') {
                                replyStore.upvotes -= 1
                                replyStore.downvotes += 1
                                replyStore.myVote = [{ value: -1 }]
                            }

                            if (type === 'upvote') {
                                replyStore.upvotes -= 1
                                replyStore.myVote = [{ value: 0 }]
                            }
                        }

                        // check if your prev vote was negative
                        if (myVoteValue === -1) {
                            // what type of vote are you doing
                            if (type === 'downvote') {
                                replyStore.upvotes += 1
                                replyStore.myVote = [{ value: 0 }]
                            }

                            if (type === 'upvote') {
                                replyStore.upvotes += 1
                                replyStore.downvotes -= 1
                                replyStore.myVote = [{ value: 1 }]
                            }
                        }

                        // you never voted
                        if (myVoteValue === 0) {
                            if (type === 'downvote') {
                                replyStore.downvotes += 1
                                replyStore.myVote = [{ value: -1 }]
                            }
                            //
                            if (type === 'upvote') {
                                replyStore.upvotes += 1
                                replyStore.myVote = [{ value: 1 }]
                            }
                        }

                        const voteObject = generateVoteObject({
                            uuid,
                            postPriv: source.postPriv,
                            value: replyStore.myVoteValue,
                        })

                        const data = await voteAsync({
                            voter: '',
                            uuid,
                            value: replyStore.myVoteValue,
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
                        return error
                    }
                },

                async finishSubmittingReply(newReply: any) {
                    try {
                        const model = new PostModel(newReply as any)
                        const signedReply = model.sign(source.postPriv)
                        const confirmedReply = await discussions.post(signedReply as any)
                        confirmedReply.myVote = [{ value: 1 }]

                        replyStore.reply.replies.push(confirmedReply)
                        replyStore.replyModel.clearReplyContent()
                        replyStore.replyModel.toggleOpen()

                        showToast('Your reply was successfully submitted', 'success')
                    } catch (error) {
                        replyStore.setReplyLoading(false)
                        showToast(error.message, 'error')
                        return error
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
                blockedPosts,
                blockedByDelegation,
                blockedUsers,
                unsignedPostsIsSpam,
                supportedTokensImages,
                blockedContentSetting,
            }
        )

        useEffect(() => {
            replyStore.setReplyModel(new NewReplyModel(reply))

            const timeout = setTimeout(() => {
                replyStore.setBlockedStatus()
                replyStore.refreshVote()
            }, 500)

            return () => {
                clearTimeout(timeout)
            }
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

        const renderHoverElements = useComputed(
            () => isSticky => {
                if (!replyStore.hover || !hasReplyModelLoaded) {
                    return null
                }

                return (
                    <ReplyHoverElements
                        post={reply}
                        replyModel={replyStore.replyModel}
                        getPermaLinkUrl={replyStore.copyAndScrollToPermalinkURL}
                        toggleFollowStatus={replyStore.toggleFollowStatus}
                        toggleToggleBlock={replyStore.toggleBlockPost}
                        hasAccount={hasAccount}
                        activePublicKey={activePublicKey}
                        isFollowing={isFollowing(reply.pub)}
                        isMarkedAsSpam={replyStore.isMarkedAsSpam}
                        isSticky={isSticky}
                        onMarkSpamComplete={replyStore.setBlockedStatus}
                    />
                )
            },
            [replyStore.hover, replyStore.isMarkedAsSpam]
        )

        if (replyStore.hidden) return null

        return (
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
                                        {() =>
                                            !replyStore.collapsed && renderHoverElements(isSticky)
                                        }
                                    </Observer>
                                </div>
                            )
                        }}
                    </Sticky>
                    <div
                        style={{
                            height: !replyStore.collapsed ? 'auto' : '80px',
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
                                upVotes={replyStore.upvotes}
                                downVotes={replyStore.downvotes}
                                myVote={replyStore.myVoteValue}
                                uuid={reply.uuid}
                                handler={replyStore.handleVote}
                            />
                        </div>

                        <div className={'flex flex-column w-100'}>
                            <div className={'flex flex-row items-center header pb0'}>
                                <div className={'pr2'}>{renderCollapseElements()}</div>
                                <UserNameWithIcon
                                    pub={replyStore.reply.pub}
                                    imageData={replyStore.reply.imageData}
                                    name={replyStore.reply.displayName}
                                />
                                <span
                                    className={'pl2 o-50 f6'}
                                    title={moment(
                                        replyStore.reply.edit
                                            ? replyStore.reply.editedAt
                                            : replyStore.reply.createdAt
                                    ).format('YYYY-MM-DD HH:mm:ss')}
                                >
                                    {replyStore.reply.edit && 'edited '}{' '}
                                    {moment(
                                        replyStore.reply.edit
                                            ? replyStore.reply.editedAt
                                            : replyStore.reply.createdAt
                                    ).fromNow()}
                                </span>
                                <Tips
                                    tokenImages={replyStore.supportedTokensImages}
                                    tips={replyStore.reply.tips}
                                />
                                <div className={'db'}>
                                    {replyStore.collapsed && (
                                        <span className={'o-50 i f6 pl2 db'}>
                                            ({reply.replies.length} children)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {replyStore.spam && replyStore.collapsed && (
                                <span className={'o-30 i f6 pt1 db'}>
                                    This post is hidden as it was marked as spam.
                                </span>
                            )}

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
                                            className={
                                                'f6 link dim ph3 pv2 dib pointer white bg-green'
                                            }
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
                                                replyStore.replyModel &&
                                                replyStore.replyModel.editing
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
                            id={`${reply.uuid}-reply`}
                            className={classNames([
                                'pl4 pr2 pb4',
                                {
                                    'post-content-hover': replyStore.hover,
                                },
                            ])}
                            open={replyStore.replyModel.open}
                            uid={reply.uuid}
                            onContentChange={replyStore.replyModel.setReplyContent}
                            value={replyStore.replyModel.replyContent}
                            loading={replyStore.replyLoading}
                            onSubmit={() => replyStore.submitReply(reply)}
                        />
                    )}

                    {!replyStore.collapsed &&
                        reply.replies &&
                        reply.replies.length > 0 &&
                        reply.replies.map(nestedReply => (
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
                                    toggleFollowStatus={replyStore.toggleFollowStatus}
                                    blockedPosts={blockedPosts}
                                    isFollowing={isFollowing}
                                    activePublicKey={activePublicKey}
                                    hasAccount={hasAccount}
                                    postPriv={postPriv}
                                    posterType={posterType}
                                    posterName={posterName}
                                    activeUidWalletKey={activeUidWalletKey}
                                    supportedTokensForUnifiedWallet={
                                        supportedTokensForUnifiedWallet
                                    }
                                    showToast={showToast}
                                    showModal={showModal}
                                    hideModal={hideModal}
                                    clearWalletPrivateKey={clearWalletPrivateKey}
                                    hasRenteredPassword={hasRenteredPassword}
                                    temporaryWalletPrivateKey={temporaryWalletPrivateKey}
                                    toggleBlockPost={toggleBlockPost}
                                    unsignedPostsIsSpam={unsignedPostsIsSpam}
                                    blockedContentSetting={blockedContentSetting}
                                    blockedByDelegation={blockedByDelegation}
                                    blockedUsers={blockedUsers}
                                />
                            </div>
                        ))}
                </StickyContainer>
            </div>
        )
    }
)

interface IRepliesProps {
    authStore: IStores['authStore']
    userStore: IStores['userStore']
    uiStore: IStores['uiStore']
    postsStore: IStores['postsStore']
    settingsStore: IStores['settingsStore']
    router: NextRouter
    supportedTokensImages: any
    replies: Post[]
    activeThread: Thread
}

const Replies: React.FC<IRepliesProps> = observer(
    ({
        authStore,
        userStore,
        replies,
        supportedTokensImages,
        router,
        uiStore,
        settingsStore,
        postsStore,
        activeThread,
    }) => {
        return (
            <div className={'card'}>
                {replies.map(reply => (
                    <Reply
                        router={router}
                        key={reply.uuid}
                        reply={reply}
                        showToast={uiStore.showToast}
                        showModal={uiStore.showModal}
                        hideModal={uiStore.hideModal}
                        currentHighlightedPostUuid={postsStore.currentHighlightedPostUuid}
                        highlightPostUuid={postsStore.highlightPostUuid}
                        supportedTokensImages={supportedTokensImages}
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
                        toggleFollowStatus={userStore.toggleUserFollowing}
                        toggleBlockPost={userStore.toggleBlockPost}
                        unsignedPostsIsSpam={settingsStore.unsignedPostsIsSpam}
                        blockedUsers={userStore.blockedUsers}
                        blockedContentSetting={settingsStore.blockedContentSetting}
                        blockedByDelegation={userStore.blockedByDelegation}
                    />
                ))}
            </div>
        )
    }
)

export default Replies
