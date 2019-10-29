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
import { Link } from '@router'
import { Votes, Reply } from '@components'
import ReactMarkdown from 'react-markdown'
import { inject, observer } from 'mobx-react'
import { ReplyModel } from '@models/replyModel'
import PostModel from '@models/postModel'
import classNames from 'classnames'
import { getIdenticon, openInNewTab } from '@utils'
import { IStores } from '@stores'

interface IReplies {
    post: PostModel
    className?: string
    getModel: (post: PostModel) => ReplyModel
    voteHandler: (uuid: string, value: number) => void
    getRepliesFromMap: (uid: string) => PostModel[]

    userStore?: IStores['userStore']
}

@inject('userStore')
@observer
class Replies extends React.Component<IReplies, any> {
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
        this.props.userStore.toggleUserFollowing(post.pub, post.posterName)
    }

    private renderUserIcon = () => {
        const { post } = this.props

        let imageData = getIdenticon()

        if (post.pub) {
            imageData = getIdenticon(post.pub)
        }

        const image = (
            <img
                width={15}
                height={15}
                src={`data:image/png;base64,${imageData}`}
                className={'post-icon mr2'}
            />
        )

        const user = <span>{post.posterName}</span>

        if (!post.pub) {
            return (
                <span
                    className={'flex items-center'}
                    title={
                        'Since no pub key was found for this post, you cannot use user actions on this user'
                    }
                >
                    {image}
                    {user}
                </span>
            )
        }

        return (
            <Link route={`/u/${post.posterName}`}>
                <a>
                    <span className={'flex items-center'}>
                        {image}
                        {/*<FontAwesomeIcon width={13} icon={faUserCircle} className={'pr1'} />*/}
                        {user}
                    </span>
                </a>
            </Link>
        )
    }

    private renderHoverElements = () => {
        if (!this.state.isHover) {
            return null
        }

        const { post, getModel, userStore } = this.props
        const { isFollowingUser } = userStore
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
                {post.pub ? (
                    isFollowingUser(post.pub) ? (
                        <span title={'Unfollow user'} onClick={() => this.toggleFollowStatus()}>
                            <FontAwesomeIcon icon={faUserMinus} className={'red'} />
                        </span>
                    ) : (
                        <span title={'Follow user'} onClick={() => this.toggleFollowStatus()}>
                            <FontAwesomeIcon icon={faUserPlus} />
                        </span>
                    )
                ) : null}
            </div>
        )
    }

    render() {
        const { post, voteHandler, getModel, getRepliesFromMap, className, userStore } = this.props
        const replyModel = getModel(post)
        const replies = getRepliesFromMap(post.uuid)

        // const renderBottomButtons = () => (
        //     <div className={'footer flex items-center pt1 ph2'}>
        //         <span className={'reply mr3 pointer dim'} onClick={replyModel.toggleOpen}>
        //             reply
        //         </span>
        //
        //         <FontAwesomeIcon width={13} icon={faLink} className={'pr2 black f6 pointer dim'} />
        //         <FontAwesomeIcon width={13} icon={faShare} className={'pr2 black f6 pointer dim'} />
        //
        //         <span className={'f6 black f6 pointer dim'}>
        //             <FontAwesomeIcon width={13} icon={faExclamationTriangle} className={'pr1'} />
        //             mark as spam
        //         </span>
        //     </div>
        // )

        return (
            <div
                className={classNames([
                    'post-reply black',
                    {
                        [className]: !!className,
                    },
                ])}
                onMouseLeave={() => this.setHover(false)}
                onMouseEnter={() => this.setHover(true)}
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
                            {this.renderUserIcon()}
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

                {/*{renderBottomButtons()}*/}

                {replyModel.open ? (
                    <Reply
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
                    ? replies.map((postReply, index) => (
                          <div
                              onMouseLeave={() => this.setHover(true)}
                              onMouseEnter={() => this.setHover(false)}
                              key={postReply.uuid}
                          >
                              <Replies
                                  post={postReply}
                                  getModel={getModel}
                                  className={'ml3'}
                                  getRepliesFromMap={getRepliesFromMap}
                                  voteHandler={voteHandler}
                                  userStore={userStore}
                              />
                          </div>
                      ))
                    : null}
            </div>
        )
    }
}

export default Replies
