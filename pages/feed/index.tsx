import * as React from 'react'
import { observer, inject } from 'mobx-react'

import './style.scss'
import { InfiniteScrollFeed } from '@components'
import { IStores } from '@stores'
import { sleep } from '@utils'

interface IIndexProps {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
    uiStore: IStores['uiStore']
}

interface IIndexState {}

@inject('postsStore', 'tagStore', 'uiStore')
@observer
class Index extends React.Component<IIndexProps, IIndexState> {
    componentWillMount(): void {
        this.props.postsStore.resetPositionAndPosts()
        this.props.tagStore.destroyActiveTag()
        this.props.uiStore.toggleSidebarStatus(true)
        this.props.uiStore.toggleBannerStatus(true)
    }

    async componentDidMount(): Promise<void> {
        await sleep(100)
        this.props.postsStore.getPostsForKeys()
    }

    public render() {
        const { getPostsForKeys, postsPosition, posts } = this.props.postsStore
        const { cursorId, items } = postsPosition

        return (
            <InfiniteScrollFeed
                dataLength={items}
                hasMore={cursorId !== 0}
                next={getPostsForKeys}
                posts={posts}
            />
        )
    }
}

export default Index
