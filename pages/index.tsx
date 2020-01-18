import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { InfiniteScrollFeed } from '@components'
import { IStores } from '@stores'
import { sleep } from '@utils'

interface IIndexPage {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
    uiStore: IStores['uiStore']
}

@inject('postsStore', 'tagStore', 'uiStore')
@observer
class Index extends React.Component<IIndexPage> {
    async componentDidMount(): Promise<void> {
        this.props.postsStore.resetPositionAndPosts()
        this.props.tagStore.destroyActiveTag()
        this.props.uiStore.toggleSidebarStatus(true)
        this.props.uiStore.toggleBannerStatus(true)
        await sleep(500)
        await this.props.postsStore.getPostsForSubs()
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
