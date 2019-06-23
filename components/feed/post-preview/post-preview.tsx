import * as React from 'react'
import { IPost } from '@stores/posts'
import moment from 'moment'
import { Votes } from '@components'

interface IPostPreviewProps {
    onClick: (post) => void
    post: IPost
}

const PostPreview: React.FC<IPostPreviewProps> = ({ post, onClick }) => (
    <div className={'post-preview'} onClick={() => onClick(post)}>
        <div className={'post-content'}>
            <div className={'flex justify-between items-center'}>
                <span className={'black f4 b'}>{post.title}</span>
                <Votes votes={post.votes} />
            </div>

            <span className={'black'}>{post.content}</span>

            <div className={'flex'}>
                <span className={'o-80 f6'}>{post.totalReplies} comments</span>
                <span className={'ml2 o-80 f6'}>{moment(post.createdAt).fromNow()}</span>
            </div>
        </div>
    </div>
)

export default PostPreview
