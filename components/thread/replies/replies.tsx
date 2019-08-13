import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faExclamationTriangle,
    faLink,
    faReply,
    faShare,
    faUserCircle,
} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import { Link } from '@router'
import { Votes, Reply } from '@components'
import ReactMarkdown from 'react-markdown'
import { observer, Observer } from 'mobx-react'
import { ReplyModel } from '@models/replyModel'
import PostModel from '@models/postModel'

interface IReplies {
    post: PostModel
    className?: string
    getModel: (post: PostModel) => ReplyModel
    voteHandler: (uuid: string, value: number) => void
    getRepliesFromMap: (uid: string) => PostModel[]
}

const Replies: React.FC<IReplies> = ({
    post,
    voteHandler,
    getModel,
    getRepliesFromMap,
    ...props
}) => {
    const replyModel = getModel(post)
    const replies = getRepliesFromMap(post.uuid)

    return (
        <Observer>
            {() => (
                <div className={'post-content post-reply black'} {...props}>
                    <div className={'header pb2'}>
                        <Link route={`/u/${post.poster}`}>
                            <a>
                                <FontAwesomeIcon width={13} icon={faUserCircle} className={'pr1'} />
                                <span>{post.poster}</span>
                            </a>
                        </Link>
                        <span className={'pl2 o-50 f6'}>{moment(post.createdAt).fromNow()}</span>
                    </div>
                    <ReactMarkdown className={'f6 lh-copy reply-content'} source={post.content} />
                    <div className={'footer flex items-center pt3'}>
                        <Votes
                            upVotes={post.upvotes}
                            downVotes={post.downvotes}
                            myVote={post.myVote}
                            uuid={post.uuid}
                            className={'mr2'}
                            handler={voteHandler}
                        />

                        <button className={'reply mr3 pointer dim'} onClick={replyModel.toggleOpen}>
                            <FontAwesomeIcon width={13} icon={faReply} className={'pr1'} />
                            reply
                        </button>

                        <FontAwesomeIcon
                            width={13}
                            icon={faLink}
                            className={'pr2 black f6 pointer dim'}
                        />
                        <FontAwesomeIcon
                            width={13}
                            icon={faShare}
                            className={'pr2 black f6 pointer dim'}
                        />

                        <span className={'f6 black f6 pointer dim'}>
                            <FontAwesomeIcon
                                width={13}
                                icon={faExclamationTriangle}
                                className={'pr1'}
                            />
                            mark as spam
                        </span>
                    </div>

                    {replyModel.open ? (
                        <Reply
                            uid={post.uuid}
                            onContentChange={replyModel.setContent}
                            onSubmit={replyModel.onSubmit}
                        />
                    ) : null}

                    {replies && replies.length
                        ? getRepliesFromMap(post.uuid).map(postReply => (
                              <Replies
                                  post={postReply}
                                  key={postReply.uuid}
                                  getModel={getModel}
                                  getRepliesFromMap={getRepliesFromMap}
                                  className={'post-content post-reply black child'}
                                  voteHandler={voteHandler}
                              />
                          ))
                        : null}
                </div>
            )}
        </Observer>
    )
}

export default observer(Replies)
