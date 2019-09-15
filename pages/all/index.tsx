import * as React from 'react'
import { IStores } from '@stores'
import { discussions, Post } from '@novuspherejs'
import PostPreview from '../../components/post-preview/post-preview'
import { inject, observer } from 'mobx-react'
import { IPost } from '@stores/posts'
import { Router } from '@router'

interface IAllProps {
    tagStore: IStores['tagStore']
    threads: Post[]
}

interface IAllState {}

@inject('tagStore')
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
        Router.pushRoute(
            `/e/${post.sub}/${post.id}/${decodeURIComponent(post.title.replace(/ /g, '_'))}`
        )
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
