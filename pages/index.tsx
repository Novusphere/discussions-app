import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { PostPreview } from '@components'
import { IStores } from '@stores'
import { IPost } from '@stores/posts'
import { pushToThread } from '@utils'

interface IIndexPage {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
}

@inject('postsStore', 'tagStore')
@observer
class Index extends React.Component<IIndexPage> {
    static async getInitialProps({ store }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        const postsStore: IStores['postsStore'] = store.postsStore
        const tagStore: IStores['tagStore'] = store.tagStore

        postsStore.resetPositionAndPosts()

        uiStore.toggleSidebarStatus(true)
        uiStore.toggleBannerStatus(true)
        tagStore.destroyActiveTag()

        const feed = await postsStore.getPostsByTag(['home'])

        return {
            feed
        }
    }

    async componentWillMount(): Promise<void> {
        // await this.props.postsStore.getPostsByTag(['home'])
    }

    public clickPost = (post: IPost) => {
        return pushToThread(post)
    }

    public render(): React.ReactNode {
        if (
            (!this.props.postsStore.posts || !this.props.postsStore.posts.length) &&
            this.props.postsStore.getPostsByTag['resolved']
        ) {
            return <span>No posts found</span>
        }

        return this.props.postsStore.posts.map(post => {
            return (
                <PostPreview
                    post={post as any}
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
