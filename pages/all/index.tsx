import * as React from 'react'
import { IStores } from '@stores'
import { Post } from '@novuspherejs'
import { inject, observer } from 'mobx-react'
import { InfiniteScrollFeed } from '@components'
import { sleep } from '@utils'

interface IAllProps {
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
    tagStore: IStores['tagStore']
    posts: Post[]
    cursorId: number
}

interface IAllState {}

@inject('postsStore', 'uiStore', 'tagStore')
@observer
class All extends React.Component<IAllProps, IAllState> {
    async componentDidMount(): Promise<void> {
        this.props.postsStore.resetPositionAndPosts()

        this.props.uiStore.toggleSidebarStatus(true)
        this.props.uiStore.toggleBannerStatus(true)
        this.props.tagStore.destroyActiveTag()

        await sleep(500)
        await this.props.postsStore.getPostsForSubs(['all'])
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
