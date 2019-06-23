import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'
import { PostPreview } from '@components'
import { Router } from '@router'
import { IPost } from '@stores/posts'

interface IFeedProps {
    postsStore: IStores['postsStore']
}

@inject('postsStore')
@observer
class Feed extends React.Component<IFeedProps> {
    public clickPost = (post: IPost) => {
        Router.pushRoute(
            `/e/${post.sub}/${post.id}/${decodeURIComponent(post.title.replace(/ /g, '_'))}`
        )
    }

    public render(): React.ReactNode {
        return this.props.postsStore.posts.map(post => (
            <PostPreview post={post} key={post.uuid} onClick={this.clickPost} />
        ))
    }
}

export default Feed as any
