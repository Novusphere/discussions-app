import * as React from 'react'
import {IPost} from "@stores/posts";
import {observer} from "mobx-react";

interface IMainPost {
    openingPost: IPost
}

const MainPost: React.FC<IMainPost> = ({openingPost}) => (
    <span>{openingPost.content}</span>
);

export default observer(MainPost)
