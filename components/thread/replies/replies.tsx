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
import { observer } from 'mobx-react'
import { Post } from '@novuspherejs/discussions/post'

interface IReplies {
    post: Post
    className?: string
    replyingPostUUID: string
    replyOpenHandler: (id: string) => void
    replyPostHandler: (content: string) => void
    submitReplyHandler: () => Promise<void>
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
            <Votes votes={post.upvotes} className={'mr2'} handler={(...args) => console.log(args)} />

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
            <Reply onContentChange={replyPostHandler} onSubmit={submitReplyHandler} />
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
