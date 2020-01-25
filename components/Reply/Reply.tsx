import * as React from 'react'
import moment from 'moment'
import {
    Form,
    ReplyBox,
    ReplyHoverElements,
    RichTextPreview,
    Tips,
    UserNameWithIcon,
    VotingHandles,
} from '@components'
import { observer, Observer } from 'mobx-react'
import { ReplyModel } from '@models/replyModel'
import PostModel from '@models/postModel'
import classNames from 'classnames'
import { getPermaLink, sleep } from '@utils'
import copy from 'clipboard-copy'
import Router from 'next/router'

import './style.scss'
import { ThreadModel } from '@models/threadModel'
import { task } from 'mobx-task'
import { Sticky, StickyContainer } from 'react-sticky'
import { ObservableMap } from 'mobx'
import { BlockedContentSetting } from '@stores/settingsStore'

interface IReplies {
    currentPath: string
    post: PostModel
    className?: string
    getModel: (post: PostModel) => ReplyModel
    voteHandler: (e: any, uuid: string, value: number) => void
    getRepliesFromMap: (uid: string) => PostModel[]
    toggleUserFollowing: (user: string, pub: string) => void
    highlightPostUuid: (uuid: string) => void
    following: ObservableMap<string, string>
    currentHighlightedPostUuid: string
    activePublicKey: string
    setCurrentReplyContent: (content: string) => void
    hasAccount: boolean
    toggleBlockPost: (asPathURL: string) => void

    isCollapsed?: boolean
    threadReference?: ThreadModel
    blockedContentSetting: BlockedContentSetting
    blockedPosts: ObservableMap<string, string>
    blockedByDelegation: ObservableMap<string, string>
    permaLink: string
    unsignedPostsIsSpam: boolean
    isBlockedUser: boolean

    tokenImages: { [symbol: string]: string }
}

interface IRepliesState {
    isHover: boolean
    isCollapsed: boolean
    isHidden: boolean
    isSpam: boolean
}

@observer
class Reply extends React.Component<IReplies, IRepliesState> {
    state = {
        isHover: false,
        isCollapsed: false,
        isHidden: false,
        isSpam: false,
    }

    @task.resolved
    private onSubmit = replyModel => {
        return replyModel.onSubmit(this.props.threadReference)
    }

    @task
    private setReplyModel = () => {
        this.replyModel = this.props.getModel(this.props.post)
        return this.replyModel
    }

    private addAndScrollToUuid = (uuid: string) => {
        if (this.replyRef.current.dataset.postUuid === uuid) {
            this.props.highlightPostUuid(uuid)
        }
    }

    private url: string
    private replyModel: ReplyModel

    async componentDidMount(): Promise<void> {
        this.setReplyModel()

        const [og, reply] = window.location.href.split('#')

        this.url = og

        if (reply) {
            const [replyUuid] = reply.split('-reply')
            if (replyUuid === this.props.post.uuid) {
                this.replyModel.toggleOpen()
            }
        }

        await sleep(1000)
        this.setBlockedStatus()
    }

    private setBlockedStatus = () => {
        const {
            blockedContentSetting,
            post,
            unsignedPostsIsSpam,
            blockedPosts,
            isBlockedUser,
            permaLink,
            blockedByDelegation,
        } = this.props

        let isBlockedByDelegation =
            blockedByDelegation.has(permaLink) || blockedByDelegation.has(post.pub)

        if (
            blockedPosts.has(permaLink) ||
            isBlockedUser ||
            isBlockedByDelegation ||
            (unsignedPostsIsSpam && !post.pub)
        ) {
            this.replyModel.open = false
            this.setState({
                isCollapsed: blockedContentSetting === 'collapsed',
                isHidden: blockedContentSetting === 'hidden',
                isSpam: true,
            })
        }
    }

    componentDidUpdate(
        prevProps: Readonly<IReplies>,
        prevState: Readonly<IRepliesState>,
        snapshot?: any
    ): void {
        if (prevProps.isBlockedUser !== this.props.isBlockedUser) {
            this.setBlockedStatus()
        }
    }

    private replyRef = React.createRef<HTMLDivElement>()

    private setHover = (state: boolean) => {
        this.setState({
            isHover: state,
        })
    }

    private toggleFollowStatus = () => {
        const { post, toggleUserFollowing } = this.props
        toggleUserFollowing(post.posterName, post.pub)
    }

    private getPermaLinkUrl = async () => {
        const { dataset } = this.replyRef.current
        const { postUuid, permalink } = dataset
        const url = `${window.location.origin}${permalink}`

        this.addAndScrollToUuid(postUuid)

        await copy(url)
        await Router.push('/tag/[name]/[id]/[title]', permalink, {
            shallow: true,
        })
    }

    private toggleToggleBlock = () => {
        const { dataset } = this.replyRef.current
        const { permalink } = dataset
        this.props.toggleBlockPost(permalink)
    }

    private renderHoverElements = (isSticky = false) => {
        if (!this.state.isHover) {
            return null
        }

        const { post, following, activePublicKey, hasAccount, blockedPosts, permaLink } = this.props

        return (
            <ReplyHoverElements
                post={post}
                replyModel={this.replyModel}
                getPermaLinkUrl={this.getPermaLinkUrl}
                toggleFollowStatus={this.toggleFollowStatus}
                toggleToggleBlock={this.toggleToggleBlock}
                hasAccount={hasAccount}
                activePublicKey={activePublicKey}
                isFollowing={following.has(post.pub)}
                isMarkedAsSpam={blockedPosts.has(permaLink)}
                isSticky={isSticky}
                onMarkSpamComplete={this.setBlockedStatus}
            />
        )
    }

    private renderVoteHandlers = (color = undefined, horizontal = false) => {
        const { post, voteHandler } = this.props

        return (
            <VotingHandles
                horizontal={horizontal}
                upVotes={post.upvotes}
                downVotes={post.downvotes}
                myVote={post.myVote}
                uuid={post.uuid}
                handler={voteHandler}
                color={color}
            />
        )
    }

    render() {
        if (this.props.isCollapsed || this.state.isHidden) return null
        if (this.setReplyModel['pending']) return null

        const {
            post,
            voteHandler,
            getModel,
            className,
            getRepliesFromMap,
            currentPath,
            threadReference,
            currentHighlightedPostUuid,
            toggleUserFollowing,
            highlightPostUuid,
            activePublicKey,
            hasAccount,
            following,
            setCurrentReplyContent,
            toggleBlockPost,
            blockedContentSetting,
            blockedPosts,
            isBlockedUser,
            unsignedPostsIsSpam,
            permaLink,
            blockedByDelegation,
            tokenImages,
        } = this.props

        const { isCollapsed, isHover, isSpam } = this.state
        const replies = getRepliesFromMap(post.uuid)

        return (
            <div
                id={post.uuid}
                ref={this.replyRef}
                data-post-uuid={post.uuid}
                data-permalink={permaLink}
                className={classNames([
                    'post-reply black mb2',
                    {
                        [className]: !!className,
                        'permalink-highlight': currentHighlightedPostUuid === post.uuid,
                    },
                ])}
                onMouseEnter={e => {
                    if (!this.replyModel.editing) this.setHover(true)
                }}
                onMouseLeave={e => {
                    if (!this.replyModel.editing) this.setHover(false)
                }}
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
                                            !isCollapsed && this.renderRenderPostScroll(isSticky)
                                        }
                                    </Observer>
                                </div>
                            )
                        }}
                    </Sticky>
                    <div
                        style={{
                            height: !isCollapsed ? 'auto' : '50px',
                        }}
                        className={classNames([
                            'parent flex flex-row pa2',
                            {
                                'post-content-hover': isHover,
                            },
                        ])}
                    >
                        <div
                            style={{
                                visibility: isCollapsed ? 'hidden' : 'visible',
                            }}
                            className={'flex flex-column justify-start items-center mr2'}
                        >
                            {this.renderVoteHandlers()}
                        </div>
                        <div className={'flex flex-column'}>
                            <div className={'flex flex-row items-center header pb0'}>
                                <div className={'pr2'}>{this.renderCollapseElements()}</div>
                                {this.renderUserElements()}
                                <div className={'db'}>
                                    {isCollapsed && (
                                        <span className={'o-50 i f6 pl2 db'}>
                                            ({replies.length} children)
                                        </span>
                                    )}
                                </div>
                            </div>
                            {isSpam && isCollapsed && (
                                <span className={'o-30 i f6 pt1 db'}>
                                    This post is hidden as it was marked as spam.
                                </span>
                            )}
                            {this.replyModel.editing && (
                                <Form
                                    form={this.replyModel.editForm}
                                    fieldClassName={'pb0'}
                                    hideSubmitButton
                                    className={'w-100 mt3'}
                                />
                            )}
                            {!isCollapsed && !this.replyModel.editing && (
                                <RichTextPreview className={'f6 lh-copy reply-content mt2'}>
                                    {post.content}
                                </RichTextPreview>
                            )}
                        </div>
                    </div>
                    <ReplyBox
                        id={`${post.uuid}-reply`}
                        className={classNames([
                            'ph4 pb4',
                            {
                                'post-content-hover': isHover,
                            },
                        ])}
                        open={this.replyModel.open}
                        uid={post.uuid}
                        onContentChange={content => {
                            this.replyModel.setContent(content)
                            setCurrentReplyContent(content)
                        }}
                        value={this.replyModel.content}
                        loading={this.replyModel.onSubmit['pending']}
                        onSubmit={() => this.onSubmit(this.replyModel)}
                    />

                    {replies && replies.length
                        ? replies.map(postReply => {
                              const _permaLink = getPermaLink(
                                  currentPath.split('#')[0],
                                  postReply.uuid
                              )
                              return (
                                  <div
                                      onMouseLeave={() => this.setHover(true)}
                                      onMouseEnter={() => this.setHover(false)}
                                      key={postReply.uuid}
                                  >
                                      <Reply
                                          blockedContentSetting={blockedContentSetting}
                                          setCurrentReplyContent={setCurrentReplyContent}
                                          post={postReply}
                                          getModel={getModel}
                                          className={'ml3 child'}
                                          getRepliesFromMap={getRepliesFromMap}
                                          voteHandler={voteHandler}
                                          currentPath={currentPath}
                                          isCollapsed={isCollapsed}
                                          threadReference={threadReference}
                                          toggleUserFollowing={toggleUserFollowing}
                                          highlightPostUuid={highlightPostUuid}
                                          activePublicKey={activePublicKey}
                                          currentHighlightedPostUuid={currentHighlightedPostUuid}
                                          hasAccount={hasAccount}
                                          following={following}
                                          toggleBlockPost={toggleBlockPost}
                                          blockedPosts={blockedPosts}
                                          unsignedPostsIsSpam={unsignedPostsIsSpam}
                                          isBlockedUser={isBlockedUser}
                                          permaLink={_permaLink}
                                          blockedByDelegation={blockedByDelegation}
                                          tokenImages={tokenImages}
                                      />
                                  </div>
                              )
                          })
                        : null}
                </StickyContainer>
            </div>
        )
    }

    private renderCollapseElements = () => {
        if (this.state.isCollapsed) {
            return (
                <span
                    className={'f6 pointer dim gray'}
                    onClick={() => this.setState({ isCollapsed: false })}
                    title={'Uncollapse comment'}
                >
                    [+]
                </span>
            )
        }
        return (
            <span
                className={'f6 pointer dim gray'}
                onClick={() => this.setState({ isCollapsed: true })}
                title={'Collapse comment'}
            >
                [-]
            </span>
        )
    }

    private renderUserElements = () => {
        const { post, tokenImages } = this.props

        return (
            <>
                <UserNameWithIcon
                    pub={post.pub}
                    imageData={post.imageData}
                    name={post.posterName}
                />
                <span
                    className={'pl2 o-50 f6'}
                    title={moment(post.edit ? post.editedAt : post.createdAt).format(
                        'YYYY-MM-DD HH:mm:ss'
                    )}
                >
                    {post.edit && 'edited '}{' '}
                    {moment(post.edit ? post.editedAt : post.createdAt).fromNow()}
                </span>
                <Tips tokenImages={tokenImages} tips={post.tips} />
            </>
        )
    }

    private renderRenderPostScroll = (isSticky = false) => {
        if (!isSticky) return this.renderHoverElements(false)
        const { isHover } = this.state

        return this.renderHoverElements(isSticky)

        return (
            <div
                className={classNames([
                    'reply-scroll-container flex flex-row items-center justify-between',
                    {
                        'rsc-hover': isHover,
                    },
                ])}
            >
                <div className={'flex flex-row items-center'}>
                    {this.renderVoteHandlers('white', true)}
                    <div className={'flex flex-row items-center'}>
                        <span className={'f6 b mh2'}>viewing reply by</span>
                        {this.renderUserElements()}
                    </div>
                </div>
                {this.renderHoverElements(isSticky)}
            </div>
        )
    }
}

export default Reply
