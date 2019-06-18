import * as React from 'react'
import {IPost} from "@stores/posts";

interface IPostPreviewProps {
    post: IPost
}

const PostPreview: React.FC<IPostPreviewProps> = ({post}) => (
    <span>{post.uuid}</span>
);

export default PostPreview
