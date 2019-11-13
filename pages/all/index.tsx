import * as React from 'react'
import { IStores } from '@stores'
import { Post } from '@novuspherejs'
import { inject, observer } from 'mobx-react'
import { InfiniteScrollFeed } from '@components'

interface IAllProps {
    postsStore: IStores['postsStore']
    posts: Post[]
    cursorId: number
}

interface IAllState {}

@inject('postsStore')
@observer
class All extends React.Component<IAllProps, IAllState> {
    static async getInitialProps({ store, res }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        const postsStore: IStores['postsStore'] = store.postsStore
        const tagStore: IStores['tagStore'] = store.tagStore

        postsStore.resetPositionAndPosts()

        uiStore.toggleSidebarStatus(true)
        uiStore.toggleBannerStatus(true)
        tagStore.destroyActiveTag()

        return {}
    }

    componentDidMount(): void {
        this.props.postsStore.getPostsForSubs(['all'])
    }

    public render() {
        const { getPostsForSubs, postsPosition, posts } = this.props.postsStore
        const { cursorId, items } = postsPosition

        return (
            <InfiniteScrollFeed
                dataLength={items}
                hasMore={cursorId !== 0}
                next={getPostsForSubs}
                posts={posts}
            />
        )
    }
}

export default All
