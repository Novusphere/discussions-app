import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'
import { PostPreview } from '@components'
import { Router } from '@router'
import { IPost } from '@stores/posts'

interface IFeedProps {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
}

@inject('postsStore', 'tagStore')
@observer
class Feed extends React.Component<IFeedProps> {
    public clickPost = (post: IPost) => {
        Router.pushRoute(
            `/e/${post.sub}/${post.id}/${decodeURIComponent(post.title.replace(/ /g, '_'))}`
        )
    }

    public render(): React.ReactNode {
        return this.props.postsStore.posts.map(post => (
            <PostPreview
                post={post}
                key={post.uuid}
                onClick={this.clickPost}
                tag={this.props.tagStore.tags.get(post.sub)}
            />
        ))
    }
}

export default Feed as any
