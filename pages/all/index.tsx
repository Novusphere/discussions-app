import * as React from 'react'
import { IStores } from '@stores'
import { discussions, Post } from '@novuspherejs'
import PostPreview from '../../components/post-preview/post-preview'
import { inject, observer } from 'mobx-react'
import { IPost } from '@stores/posts'
import { pushToThread } from '@utils'

interface IAllProps {
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    threads: Post[]
}

interface IAllState {}

@inject('tagStore', 'postsStore')
@observer
class All extends React.Component<IAllProps, IAllState> {
    static async getInitialProps({ store }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        const postsStore: IStores['postsStore'] = store.postsStore
        const tagStore: IStores['tagStore'] = store.tagStore

        postsStore.resetPositionAndPosts()

        uiStore.toggleSidebarStatus(true)
        uiStore.toggleBannerStatus(true)
        tagStore.destroyActiveTag()

        tagStore.destroyActiveTag()
        const threads = await discussions.getPostsForSubs(['all'])
        return {
            threads,
        }
    }

    public clickPost = (post: IPost) => {
        pushToThread(post)
    }

    public render() {
        return this.props.threads
            .filter(result => result.tags[0].length)
            .map(thread => (
                <PostPreview
                    key={thread.id}
                    post={thread as any}
                    onClick={this.clickPost}
                    tag={this.props.tagStore.tags.get(thread.sub)}
                    disableVoteHandler
                />
            ))
    }
}

export default All
