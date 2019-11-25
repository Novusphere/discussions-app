import * as React from 'react'
import moment from 'moment'
import { ReplyBox, UserNameWithIcon, Votes, RichTextPreview, ReplyHoverElements } from '@components'
import { inject, observer, Observer } from 'mobx-react'
import { ReplyModel } from '@models/replyModel'
import PostModel from '@models/postModel'
import classNames from 'classnames'
import { getPermaLink } from '@utils'
import { IStores } from '@stores'
import copy from 'clipboard-copy'
import Router from 'next/router'

import './style.scss'
import Form from '../create-form/form'
import { ThreadModel } from '@models/threadModel'
import { task } from 'mobx-task'
import { StickyContainer, Sticky } from 'react-sticky'

interface IReplies {
    currentPath: string
    post: PostModel
    className?: string
    getModel: (post: PostModel) => ReplyModel
    voteHandler: (uuid: string, value: number) => void
    getRepliesFromMap: (uid: string) => PostModel[]

    userStore?: IStores['userStore']
    newAuthStore?: IStores['newAuthStore']
    postsStore?: IStores['postsStore']

    isCollapsed?: boolean
    threadReference?: ThreadModel
}

interface IRepliesState {
    isHover: boolean
    isCollapsed: boolean
}

@inject('userStore', 'newAuthStore', 'postsStore')
@observer
class Reply extends React.Component<IReplies, IRepliesState> {
    state = {
        isHover: false,
        isCollapsed: false,
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
            this.props.postsStore.highlightPostUuid(uuid)
        }
    }

    private url: string
    private replyModel: ReplyModel

    componentDidMount(): void {
        this.setReplyModel()

        const [og, reply] = window.location.href.split('#')

        this.url = og

        if (reply) {
            const [replyUuid] = reply.split('-reply')
            if (replyUuid === this.props.post.uuid) {
                this.replyModel.toggleOpen()
            }
        }
    }

    private replyRef = React.createRef<HTMLDivElement>()

    private setHover = (state: boolean) => {
        this.setState({
            isHover: state,
        })
    }

    private toggleFollowStatus = () => {
        const { post } = this.props
        this.props.userStore.toggleUserFollowing(post.posterName, post.pub)
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

    private renderHoverElements = () => {
        if (!this.state.isHover) {
            return null
        }

        const { post, userStore, newAuthStore } = this.props
        const { following } = userStore
        const { activePublicKey, hasAccount } = newAuthStore

        return (
            <ReplyHoverElements
                post={post}
                replyModel={this.replyModel}
                getPermaLinkUrl={this.getPermaLinkUrl}
                toggleFollowStatus={this.toggleFollowStatus}
                hasAccount={hasAccount}
                activePublicKey={activePublicKey}
                isFollowing={following.has(post.pub)}
            />
        )
    }

    render() {
        if (this.props.isCollapsed) return null
        if (this.setReplyModel['pending']) return null

        const {
            post,
            voteHandler,
            getModel,
            getRepliesFromMap,
            userStore,
            newAuthStore,
            currentPath,
            postsStore,
            threadReference,
        } = this.props

        const { isCollapsed, isHover } = this.state
        const replies = getRepliesFromMap(post.uuid)
        const [currentPathTrimmed] = currentPath.split('#')

        return (
            <a id={post.uuid}>
                <object>
                    <div
                        ref={this.replyRef}
                        data-post-uuid={post.uuid}
                        data-permalink={getPermaLink(currentPathTrimmed, post.uuid)}
                        className={classNames([
                            'post-reply black',
                            {
                                'permalink-highlight':
                                    postsStore.currentHighlightedPostUuid === post.uuid,
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
                                {({ style }) => (
                                    <div
                                        style={{
                                            ...style,
                                            top: 60,
                                            zIndex: 9999,
                                        }}
                                    >
                                        <Observer>{() => this.renderHoverElements()}</Observer>
                                    </div>
                                )}
                            </Sticky>
                            <div
                                style={{
                                    height: !isCollapsed ? 'auto' : '30px',
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
                                    <Votes
                                        upVotes={post.upvotes}
                                        downVotes={post.downvotes}
                                        myVote={post.myVote}
                                        uuid={post.uuid}
                                        handler={voteHandler}
                                    />
                                </div>
                                <div className={'flex flex-column'}>
                                    <div className={'header pb0'}>
                                        <div className={'pr2'}>{this.renderCollapseElements()}</div>
                                        <UserNameWithIcon
                                            pub={post.pub}
                                            imageData={post.imageData}
                                            name={post.posterName}
                                        />
                                        <span
                                            className={'pl2 o-50 f6'}
                                            title={moment(
                                                post.edit ? post.editedAt : post.createdAt
                                            ).format('YYYY-MM-DD HH:mm:ss')}
                                        >
                                            {post.edit && 'edited '}{' '}
                                            {moment(
                                                post.edit ? post.editedAt : post.createdAt
                                            ).fromNow()}
                                        </span>
                                        {isCollapsed && (
                                            <span className={'o-50 i f6 pl2'}>
                                                ({replies.length} children)
                                            </span>
                                        )}
                                    </div>
                                    {this.replyModel.editing && (
                                        <Form
                                            form={this.replyModel.editForm}
                                            fieldClassName={'pb0'}
                                            hideSubmitButton
                                            className={'w-100 mt3'}
                                        />
                                    )}
                                    {!isCollapsed && !this.replyModel.editing && (
                                        <RichTextPreview className={'f6 lh-copy reply-content'}>
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
                                onContentChange={this.replyModel.setContent}
                                value={this.replyModel.content}
                                loading={this.replyModel.onSubmit['pending']}
                                onSubmit={() => this.onSubmit(this.replyModel)}
                            />

                            {replies && replies.length
                                ? replies.map(postReply => (
                                      <div
                                          onMouseLeave={() => this.setHover(true)}
                                          onMouseEnter={() => this.setHover(false)}
                                          key={postReply.uuid}
                                      >
                                          <Reply
                                              post={postReply}
                                              getModel={getModel}
                                              className={'ml3'}
                                              getRepliesFromMap={getRepliesFromMap}
                                              voteHandler={voteHandler}
                                              userStore={userStore}
                                              newAuthStore={newAuthStore}
                                              postsStore={postsStore}
                                              currentPath={currentPath}
                                              isCollapsed={isCollapsed}
                                              threadReference={threadReference}
                                          />
                                      </div>
                                  ))
                                : null}
                        </StickyContainer>
                    </div>
                </object>
            </a>
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
}

export default Reply
