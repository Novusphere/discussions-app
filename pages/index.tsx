import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { PostPreview } from '@components'
import { IStores } from '@stores'
import { IPost } from '@stores/posts'
import { Router } from '@router'

interface IIndexPage {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
}

@inject('postsStore', 'tagStore')
@observer
class Index extends React.Component<IIndexPage> {
    static async getInitialProps({ store }) {
        const tagStore: IStores['tagStore'] = store.tagStore
        tagStore.destroyActiveTag()
        return {}
    }

    async componentWillMount(): Promise<void> {
        await this.props.postsStore.getPostsByTag(['home'])
    }

    public clickPost = (post: IPost) => {
        Router.pushRoute(
            `/e/${post.sub}/${post.id}/${decodeURIComponent(post.title.replace(/ /g, '_'))}`
        )
    }

    public render(): React.ReactNode {
        if (!this.props.postsStore.posts || !this.props.postsStore.posts.length) {
            return <span>No posts found</span>
        }

        return this.props.postsStore.posts.map(post => {
            return (
                <PostPreview
                    post={post}
                    key={post.uuid}
                    onClick={this.clickPost}
                    tag={this.props.tagStore.tags.get(post.sub)}
                    voteHandler={this.props.postsStore.vote}
                />
            )
        })
    }
}

export default Index
