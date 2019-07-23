import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { PostPreview } from '@components'
import { IStores } from '@stores'
import { IPost } from '@stores/posts'
import { Router } from '@router'
import { discussions, Post } from '@novuspherejs'

interface IIndexPage {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
}

@inject('postsStore', 'tagStore')
@observer
class Index extends React.Component<IIndexPage> {
    async componentWillMount(): Promise<void> {
        await this.props.postsStore.getPostsByTag(['home'])
    }

    public clickPost = (post: IPost) => {
        Router.pushRoute(
            `/e/${post.sub}/${post.id}/${decodeURIComponent(post.title.replace(/ /g, '_'))}`
        )
    }

    public render(): React.ReactNode {
        console.log('inside index')

        /*if (typeof window !== 'undefined') {
            (async function () {
                const bk = discussions.bkCreate();
                const keys = await discussions.bkToKeys(bk);
                console.log(keys);
            })();
        }*/

        return this.props.postsStore.posts.map(post => {
            if (post instanceof Post) {
                return (
                    <PostPreview
                        post={post.openingPost as Post}
                        key={post.uuid}
                        onClick={this.clickPost}
                        tag={this.props.tagStore.tags.get(post.sub)}
                        voteHandler={this.props.postsStore.vote}
                    />
                )
            }
        })
    }
}

export default Index
