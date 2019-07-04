import * as React from 'react'
import { IPost } from '@stores/posts'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faExclamationTriangle,
    faLink,
    faReply,
    faShare,
    faSpinner,
    faUserCircle,
} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import { Link } from '@router'
import { Editor, Votes } from '@components'
import ReactMarkdown from 'react-markdown'
import { observer } from 'mobx-react'

interface IReplies {
    post: IPost
    className?: string
    replyingPostUUID: string
    replyOpenHandler: (id: string) => void
    replyPostHandler: (content: string) => void
    submitReplyHandler: () => void
}

const Replies: React.FC<IReplies> = ({
    post,
    replyingPostUUID,
    replyPostHandler,
    replyOpenHandler,
    submitReplyHandler,
    ...props
}) => (
    <div className={'post-content post-reply black'} {...props}>
        <div className={'header pb2'}>
            <Link route={`/u/${post.poster}`}>
                <a>
                    <FontAwesomeIcon icon={faUserCircle} className={'pr1'} />
                    <span>{post.poster}</span>
                </a>
            </Link>
            <span className={'pl2 o-50 f6'}>{moment(post.createdAt).fromNow()}</span>
        </div>
        <ReactMarkdown className={'f6 lh-copy'} source={post.content} />
        <div className={'footer flex items-center pt3'}>
            <Votes votes={post.votes} className={'mr2'} />

            <button
                className={'reply mr3 pointer dim'}
                onClick={() => {
                    replyOpenHandler(post.uuid)
                }}
            >
                <FontAwesomeIcon icon={faReply} className={'pr1'} />
                reply
            </button>

            <FontAwesomeIcon icon={faLink} className={'pr2 black f6 pointer dim'} />
            <FontAwesomeIcon icon={faShare} className={'pr2 black f6 pointer dim'} />

            <span className={'f6 black f6 pointer dim'}>
                <FontAwesomeIcon icon={faExclamationTriangle} className={'pr1'} />
                mark as spam
            </span>
        </div>

        {replyingPostUUID === post.uuid ? (
            <div className={'mt3'}>
                <Editor
                    placeholder={'Enter your reply'}
                    className={'db f6'}
                    onChange={replyPostHandler}
                />
                {submitReplyHandler['match']({
                    pending: () => (
                        <button
                            disabled
                            className={'mt3 f6 link dim br2 ph3 pv2 dib mr2 pointer white bg-green'}
                        >
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </button>
                    ),
                    rejected: (error) => (
                        <div className={'flex flex-column'}>
                            <span className={'red f6 pt3'}>
                                {error.message}
                            </span>
                            <button
                                className={
                                    'mt3 f6 link dim br2 ph3 pv2 dib mr2 pointer white bg-green'
                                }
                            >
                                Post reply
                            </button>
                        </div>
                    ),
                    resolved: () => (
                        <button
                            onClick={submitReplyHandler}
                            className={'mt3 f6 link dim br2 ph3 pv2 dib mr2 pointer white bg-green'}
                        >
                            Post reply
                        </button>
                    ),
                })}
            </div>
        ) : null}

        {post.replies.map(reply => (
            <Replies
                post={reply}
                key={reply.id}
                replyingPostUUID={replyingPostUUID}
                replyOpenHandler={replyOpenHandler}
                replyPostHandler={replyPostHandler}
                submitReplyHandler={submitReplyHandler}
                className={'post-content post-reply black child'}
            />
        ))}
    </div>
)

export default observer(Replies)
