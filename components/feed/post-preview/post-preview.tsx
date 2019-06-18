import * as React from 'react'
import {IPost} from "@stores/posts";
import moment from 'moment'

interface IPostPreviewProps {
    post: IPost
}

const PostPreview: React.FC<IPostPreviewProps> = ({post}) => (
    <div className={'post-preview'}>
        <div className={'post-content'}>
            <div className={'flex justify-between'}>
            <span className={'black f4 b'}>
                {post.title}
            </span>
                <span className={'black f6 vote'}>
                <svg
                    data-v-35c9ffd2=""
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="caret-up"
                    role="img" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    className="svg-inline--fa fa-caret-up fa-w-10">
                    <path
                        data-v-35c9ffd2=""
                        fill="currentColor"
                        d="M288.662 352H31.338c-17.818 0-26.741-21.543-14.142-34.142l128.662-128.662c7.81-7.81 20.474-7.81 28.284 0l128.662 128.662c12.6 12.599 3.676 34.142-14.142 34.142z"
                    />
                </svg>
                    {post.votes}
            </span>
            </div>

            <span className={'black'}>
                {post.content}
            </span>

            <div className={'flex'}>
                <span className={'o-80 f6'}>
                    {post.totalReplies} comments
                </span>
                <span className={'ml2 o-80 f6'}>
                    {moment(post.createdAt).fromNow()}
                </span>
            </div>
        </div>
    </div>
);

export default PostPreview
