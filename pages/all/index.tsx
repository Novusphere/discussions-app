import * as React from 'react'
import { IStores } from '@stores'
import { Post } from '@novuspherejs'
import { inject, observer } from 'mobx-react'
import { InfiniteScrollFeed } from '@components'

interface IAllProps {
    tagStore: IStores['tagStore']
    posts: Post[]
    cursorId: number
}

interface IAllState {}

@inject('tagStore')
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

        return {}
    }

    public render() {
        const { getPostsBySubscribed, postsPosition, allPosts } = this.props.tagStore
        const { cursorId, count } = postsPosition

        return (
            <InfiniteScrollFeed
                dataLength={count}
                hasMore={cursorId !== 0}
                next={getPostsBySubscribed}
                posts={allPosts}
            />
        )
    }
}

export default All
