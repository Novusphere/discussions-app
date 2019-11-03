import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faDollarSign,
    faEye,
    faLink,
    faReply,
    faUserMinus,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import { ReplyBox, UserNameWithIcon, Votes } from '@components'
import ReactMarkdown from 'react-markdown'
import { inject, observer } from 'mobx-react'
import { ReplyModel } from '@models/replyModel'
import PostModel from '@models/postModel'
import classNames from 'classnames'
import { getPermaLink, openInNewTab } from '@utils'
import { IStores } from '@stores'
import copy from 'clipboard-copy'
import Router from 'next/router'

import './style.scss'

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
}

@inject('userStore', 'newAuthStore', 'postsStore')
@observer
class Reply extends React.Component<IReplies, any> {
    state = {
        isHover: false,
    }

    componentDidMount(): void {
        if (this.props.currentPath.indexOf('#') !== -1) {
            const [, uuid] = this.props.currentPath.split('#')
            this.addAndScrollToUuid(uuid)
        }
    }

    private addAndScrollToUuid = (uuid: string) => {
        if (this.replyRef.current.dataset.postUuid === uuid) {
            this.props.postsStore.highlightPostUuid(uuid)
            window.scrollTo(0, this.replyRef.current.offsetTop)
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
        await Router.push('/e/[name]/[id]/[title]', permalink, {
            shallow: true,
        })
    }

    private renderHoverElements = () => {
        if (!this.state.isHover) {
            return null
        }

        const { post, getModel, userStore, newAuthStore } = this.props
        const { isFollowingUser } = userStore
        const { activePublicKey, hasAccount } = newAuthStore
        const replyModel = getModel(post)

        return (
            <div className={'hover-elements disable-user-select'}>
                <span onClick={replyModel.toggleOpen} title={'Reply to post'}>
                    <FontAwesomeIcon icon={faReply} />
                </span>
                <span title={'Permalink'} onClick={this.getPermaLinkUrl}>
                    <FontAwesomeIcon icon={faLink} />
                </span>
                <span title={'Donate tokens'}>
                    <FontAwesomeIcon icon={faDollarSign} />
                </span>
                <span
                    title={'View block'}
                    onClick={() => openInNewTab(`https://eosq.app/tx/${post.transaction}`)}
                >
                    <FontAwesomeIcon icon={faEye} />
                </span>
                {post.pub && hasAccount && activePublicKey !== post.pub ? (
                    isFollowingUser(post.posterName) ? (
                        <span title={'Unfollow user'} onClick={this.toggleFollowStatus}>
                            <FontAwesomeIcon icon={faUserMinus} className={'red'} />
                        </span>
                    ) : (
                        <span title={'Follow user'} onClick={this.toggleFollowStatus}>
                            <FontAwesomeIcon icon={faUserPlus} />
                        </span>
                    )
                ) : null}
            </div>
        )
    }

    render() {
        const {
            post,
            voteHandler,
            getModel,
            getRepliesFromMap,
            className,
            userStore,
            newAuthStore,
            currentPath,
            postsStore,
        } = this.props

        const replyModel = getModel(post)
        const replies = getRepliesFromMap(post.uuid)

        const [currentPathTrimmed] = currentPath.split('#')

        return (
            <div
                ref={this.replyRef}
                data-post-uuid={post.uuid}
                data-permalink={getPermaLink(currentPathTrimmed, post.uuid)}
                className={classNames([
                    'post-reply black',
                    {
                        [className]: !!className,
                        'permalink-highlight': postsStore.currentHighlightedPostUuid === post.uuid,
                    },
                ])}
                onMouseEnter={() => this.setHover(true)}
                onMouseLeave={() => this.setHover(false)}
            >
                {this.renderHoverElements()}
                <div
                    className={classNames([
                        'parent flex flex-row pa2',
                        {
                            'post-content-hover': this.state.isHover,
                        },
                    ])}
                >
                    <div className={'flex justify-between items-center mr2'}>
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
                            <UserNameWithIcon imageData={post.imageData} name={post.posterName} />
                            <span className={'pl2 o-50 f6'}>
                                {moment(post.createdAt).fromNow()}
                            </span>
                        </div>
                        <ReactMarkdown
                            className={'f6 lh-copy reply-content'}
                            source={post.content}
                        />
                    </div>
                </div>

                {replyModel.open ? (
                    <ReplyBox
                        className={classNames([
                            'ph4 pb4',
                            {
                                'post-content-hover': this.state.isHover,
                            },
                        ])}
                        uid={post.uuid}
                        onContentChange={replyModel.setContent}
                        onSubmit={replyModel.onSubmit}
                    />
                ) : null}

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
                              />
                          </div>
                      ))
                    : null}
            </div>
        )
    }
}

export default Reply
