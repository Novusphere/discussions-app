import * as React from 'react'
import { IPost } from '@stores/posts'
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
import { Votes } from '@components'

interface IReplies {
    post: IPost
    className?: string
}

const Replies: React.FC<IReplies> = ({ post, ...props }) => (
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
        <span className={'f6 lh-copy'}>{post.content}</span>
        <div className={'footer flex items-center pt3'}>
            <Votes votes={post.votes} className={'mr2'} />

            <button className={'reply mr3'}>
                <FontAwesomeIcon icon={faReply} className={'pr1'} />
                reply
            </button>

            <FontAwesomeIcon icon={faLink} className={'pr2 black f6'} />
            <FontAwesomeIcon icon={faShare} className={'pr2 black f6'} />

            <span className={'f6 black f6'}>
                <FontAwesomeIcon icon={faExclamationTriangle} className={'pr1'} />
                mark as spam
            </span>
        </div>
    </div>
)

export default Replies
