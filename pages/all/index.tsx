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
        const tagStore: IStores['tagStore'] = store.tagStore
        tagStore.destroyActiveTag()
        const threads = await discussions.getPostsForSubs(['all'])
        return {
            threads,
        }
    }

    public clickPost = (post: IPost) => {
        const id = this.props.postsStore.encodeId(post) // Post.encodeId(post.transaction, new Date(post.createdAt));
        pushToThread(post, id)
    }

    public render() {
        return this.props.threads.map(thread => (
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
