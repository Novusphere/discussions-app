import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faDollarSign,
    faLink,
    faReply,
    faUserMinus,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import { Votes, ReplyBox, UserNameWithIcon } from '@components'
import ReactMarkdown from 'react-markdown'
import { inject, observer } from 'mobx-react'
import { ReplyModel } from '@models/replyModel'
import PostModel from '@models/postModel'
import classNames from 'classnames'
import { openInNewTab } from '@utils'
import { IStores } from '@stores'

interface IReplies {
    post: PostModel
    className?: string
    getModel: (post: PostModel) => ReplyModel
    voteHandler: (uuid: string, value: number) => void
    getRepliesFromMap: (uid: string) => PostModel[]

    userStore?: IStores['userStore']
    newAuthStore?: IStores['newAuthStore']
}

@inject('userStore', 'newAuthStore')
@observer
class Reply extends React.Component<IReplies, any> {
    state = {
        isHover: false,
    }

    private setHover = (state: boolean) => {
        this.setState({
            isHover: state,
        })
    }

    private toggleFollowStatus = () => {
        const { post } = this.props
        this.props.userStore.toggleUserFollowing(post.posterName, post.pub)
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
                <span title={'Donate tokens'}>
                    <FontAwesomeIcon icon={faDollarSign} />
                </span>
                <span
                    title={'View block'}
                    onClick={() => openInNewTab(`https://eosq.app/tx/${post.transaction}`)}
                >
                    <FontAwesomeIcon icon={faLink} />
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
        } = this.props

        const replyModel = getModel(post)
        const replies = getRepliesFromMap(post.uuid)

        return (
            <div
                className={classNames([
                    'post-reply black',
                    {
                        [className]: !!className,
                    },
                ])}
                onMouseEnter={() => this.setHover(true)}
                onMouseLeave={() => this.setHover(false)}
            >
                {this.renderHoverElements()}
                <div
                    className={classNames([
                        'flex flex-row pa2',
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
                              />
                          </div>
                      ))
                    : null}
            </div>
        )
    }
}

export default Reply
