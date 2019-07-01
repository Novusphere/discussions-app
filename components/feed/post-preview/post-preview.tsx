import * as React from 'react'
import { IPost } from '@stores/posts'
import moment from 'moment'
import { Votes } from '@components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import { TagModel } from '@models/tagModel'

interface IPostPreviewProps {
    onClick: (post) => void
    post: IPost
    tag: TagModel
}

const PostPreview: React.FC<IPostPreviewProps> = ({ post, onClick, tag }) => (
    <div className={'post-preview'}>
        <div className={'flex flex-auto'}>
            <div className={'bg-light-gray flex tc justify-center ph2 pv4 relative z-2 flex-auto'}>
                <Votes votes={post.votes} />
            </div>

            <div
                className={'flex flex-column post-content w-100 content-fade'}
                onClick={() => onClick(post)}
            >
                <div className={'flex f6 lh-copy black items-center'}>
                    <img src={tag.icon} title={`${tag.name} icon`} className={'w-10'} />
                    <span className={'b ttu'}>{post.sub}</span>
                    <span className={'ph1 b'}>&#183;</span>
                    <span className={'o-80'}>by {post.poster}</span>
                    <span className={'o-50 pl2'}>{moment(post.createdAt).fromNow()}</span>
                </div>
                <div className={'flex justify-between items-center pt1 pb3'}>
                    <span className={'black f3 b lh-title'}>{post.title}</span>
                </div>

                <span className={'black lh-copy measure-wide'}>{post.content}</span>

                <div className={'flex z-2 relative mt3 footer b'}>
                    <span className={'o-80 f6 ml2 dim pointer'}>
                        <FontAwesomeIcon icon={faComment} className={'pr2'} />
                        {post.totalReplies} comments
                    </span>
                    <span className={'o-80 f6 ml2 dim pointer'}>
                        share
                    </span>
                    <span className={'o-80 f6 ml2 dim pointer'}>
                        reply
                    </span>
                    <span className={'o-80 f6 ml2 dim pointer'}>
                        mark as spam
                    </span>
                </div>
            </div>
        </div>
    </div>
)

export default PostPreview
