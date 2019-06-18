import * as React from 'react'
import {inject, observer} from "mobx-react";
import {IStores} from "@stores/index";
import {PostPreview} from "@components";

interface IFeedProps {
    postsStore: IStores['postsStore']
}

@inject('postsStore')
@observer
class Feed extends React.Component<IFeedProps> {
    public render(): React.ReactNode {
        return this.props.postsStore.posts.map(post => (
            <PostPreview post={post} key={post.uuid}/>
        ))
    }
}

export default Feed as any
