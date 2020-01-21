import * as React from 'react'
import { inject, observer } from 'mobx-react'

import './style.scss'
import { OpeningPost, Reply, ReplyBox } from '@components'
import { ThreadModel } from '@models/threadModel'
import { IStores } from '@stores'
import { NextRouter, withRouter } from 'next/router'
import { Thread as NSThread } from '@novuspherejs'
import { observable } from 'mobx'
import { ReplyModel } from '@models/replyModel'
import { ModalOptions } from '@globals'
import { getPermaLink } from '@utils'

interface IThreadOuterProps {
    thread: NSThread
}

interface IThreadInnerProps {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
    notificationsStore: IStores['notificationsStore']
    userStore: IStores['userStore']
    authStore: IStores['authStore']
    uiStore: IStores['uiStore']
    settingsStore: IStores['settingsStore']
    router: NextRouter
}

interface IThreadState {}

@(withRouter as any)
@inject(
    'postsStore',
    'userStore',
    'authStore',
    'tagStore',
    'notificationsStore',
    'uiStore',
    'settingsStore'
)
@observer
class Thread extends React.Component<IThreadOuterProps & IThreadInnerProps, IThreadState> {
    @observable threadAsModel: ThreadModel = null
    @observable openingReplyModel: ReplyModel = null

    constructor(props) {
        super(props)
        this.threadAsModel = new ThreadModel(props.thread)
        this.openingReplyModel = this.threadAsModel.rbModel(props.thread.openingPost)
    }

    async componentDidMount(): Promise<void> {
        window.addEventListener('beforeunload', this.handleWindowClose)
    }

    componentWillUnmount(): void {
        this.threadAsModel.toggleEditing(false)

        if (this.props.postsStore.currentHighlightedPostUuid) {
            this.props.postsStore.highlightPostUuid('')
        }

        if (process.browser) {
            window.removeEventListener('beforeunload', this.handleWindowClose)
        }
    }

    handleWindowClose = e => {
        if (this.props.postsStore.hasReplyContent) {
            e.preventDefault()
            return (e.returnValue = 'You have unsaved changes - are you sure you wish to close?')
        }
    }

    addAsModerator = () => {
        const {
            threadAsModel,
            props: {
                userStore: { setModerationMemberByTag },
                tagStore: { activeTag },
            },
        } = this

        const mergedNameWithPub = `${threadAsModel.openingPost.posterName}:${threadAsModel.openingPost.pub}`
        setModerationMemberByTag(mergedNameWithPub, activeTag.name)
    }

    private handleWatchPost = (id, replies) => {
        if (!this.props.authStore.hasAccount) {
            this.props.uiStore.showToast('You must be logged in to watch posts', 'error')
            return
        }
        this.props.userStore.toggleThreadWatch(id, replies)
    }

    private renderOpeningPost = () => {
        const {
            router,
            uiStore,
            authStore: { supportedTokensImages },
            postsStore: { hasReplyContent },
            tagStore: { activeTag },
            userStore: { isWatchingThread, toggleThreadWatch, toggleBlockPost, blockedPosts },
        } = this.props

        const { threadAsModel } = this

        return (
            <OpeningPost
                addAsModerator={this.addAsModerator}
                showPostWarningCloseModal={() => uiStore.showModal(ModalOptions.postWarningClose)}
                hasReplyContent={hasReplyContent}
                openingPost={threadAsModel.openingPost}
                asPath={router.asPath}
                id={router.query.id as string}
                activeThread={threadAsModel}
                activeTag={activeTag}
                canEditPost={threadAsModel.canEditPost}
                isWatchingPost={isWatchingThread}
                toggleBlockPost={toggleBlockPost}
                watchPost={this.handleWatchPost}
                isBlockedPost={blockedPosts.has(router.asPath)}
                tokenImages={supportedTokensImages}
            />
        )
    }

    private renderOpeningPostReplyBox = () => {
        const { threadAsModel } = this
        const {
            postsStore: { setCurrentReplyContent },
            thread: { uuid },
        } = this.props

        const { onSubmit, content, open, setContent } = this.openingReplyModel

        return (
            <div className={'mb3'}>
                <ReplyBox
                    open={open}
                    uid={uuid}
                    onContentChange={content => {
                        setContent(content)
                        setCurrentReplyContent(content)
                    }}
                    onSubmit={() => onSubmit(threadAsModel)}
                    loading={onSubmit['pending']}
                    value={content}
                />
            </div>
        )
    }

    private renderReplyContent = () => {
        const { thread } = this.props

        return (
            <>
                {thread.openingPost.totalReplies > 0 && (
                    <div className={'mb2'} id={'comments'}>
                        <span className={'b f6 pb2'}>
                            viewing all {thread.openingPost.totalReplies} comments
                        </span>
                    </div>
                )}
                {this.renderReplies()}
            </>
        )
    }

    private renderReplies = () => {
        const {
            router,
            userStore: {
                toggleUserFollowing,
                following,
                toggleBlockPost,
                blockedPosts,
                blockedUsers,
                blockedByDelegation,
            },
            postsStore: { highlightPostUuid, currentHighlightedPostUuid, setCurrentReplyContent },
            authStore: { activePublicKey, hasAccount, supportedTokensImages },
            settingsStore: { blockedContentSetting, unsignedPostsIsSpam },
        } = this.props

        const {
            threadAsModel: { openingPostReplies, rbModel, getRepliesFromMap, vote },
        } = this

        return (
            <div className={'card'}>
                {openingPostReplies.map(reply => {
                    return (
                        <Reply
                            setCurrentReplyContent={setCurrentReplyContent}
                            currentPath={router.asPath}
                            post={reply}
                            key={reply.uuid}
                            getModel={rbModel}
                            voteHandler={vote}
                            threadReference={this.threadAsModel}
                            getRepliesFromMap={getRepliesFromMap}
                            toggleUserFollowing={toggleUserFollowing}
                            highlightPostUuid={highlightPostUuid}
                            activePublicKey={activePublicKey}
                            currentHighlightedPostUuid={currentHighlightedPostUuid}
                            hasAccount={hasAccount}
                            following={following}
                            toggleBlockPost={toggleBlockPost}
                            blockedContentSetting={blockedContentSetting}
                            permaLink={getPermaLink(router.asPath.split('#')[0], reply.uuid)}
                            blockedPosts={blockedPosts}
                            blockedByDelegation={blockedByDelegation}
                            isBlockedUser={blockedUsers.has(reply.pub)}
                            unsignedPostsIsSpam={unsignedPostsIsSpam}
                            tokenImages={supportedTokensImages}
                        />
                    )
                })}
            </div>
        )
    }

    public render() {
        return (
            <>
                {this.renderOpeningPost()}
                {this.renderOpeningPostReplyBox()}
                {this.renderReplyContent()}
            </>
        )
    }
}

export default Thread as React.ComponentClass<IThreadOuterProps>
