import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { InfiniteScrollFeed } from '@components'
import { IStores } from '@stores'

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

        return {}
    }

    componentDidMount(): void {
        this.props.postsStore.getPostsForSubs()
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

export default Index
