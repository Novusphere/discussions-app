import * as React from 'react'
import { IStores } from '@stores'
import { discussions, Post } from '@novuspherejs'
import { observer } from 'mobx-react'
import { IPost } from '@stores/posts'
import { pushToThread } from '@utils'
import { InfiniteScrollFeed } from '@components'

interface IAllProps {
    posts: Post[]
    cursorId: number
}

interface IAllState {
    posts: Post[]
    cursorId: number
}

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

        const { posts, cursorId } = await discussions.getPostsForSubs(['all'])

        return {
            posts: posts.filter(result => result.tags[0].length),
            cursorId,
        }
    }

    constructor(props) {
        super(props)

        this.state = {
            posts: props.posts,
            cursorId: props.cursorId,
        }
    }

    public clickPost = (post: IPost) => {
        pushToThread(post)
    }

    private getMorePosts = async () => {
        try {
            const { posts, cursorId } = await discussions.getPostsForSubs(
                ['all'],
                this.state.cursorId,
                this.state.posts.length
            )

            this.setState(prevState => ({
                posts: [...prevState.posts, ...posts],
                cursorId,
            }))
        } catch (error) {
            return error
        }
    }

    public render() {
        const { cursorId, posts } = this.state

        return (
            <InfiniteScrollFeed
                dataLength={posts.length}
                hasMore={cursorId !== 0}
                next={this.getMorePosts}
                posts={posts}
                postOnClick={this.clickPost}
            />
        )
    }
}

export default All
