import * as React from 'react'
import { IStores } from '@stores'
import { Post } from '@novuspherejs'
import { inject, observer } from 'mobx-react'
import { InfiniteScrollFeed } from '@components'
import { NextRouter, withRouter } from 'next/router'

interface IAllProps {
    router: NextRouter
    postsStore: IStores['postsStore']
    posts: Post[]
    cursorId: number
}

interface IAllState {}

@(withRouter as any)
@inject('postsStore')
@observer
class Tags extends React.Component<IAllProps, IAllState> {
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

    componentDidUpdate(
        prevProps: Readonly<IAllProps>,
        prevState: Readonly<IAllState>,
        snapshot?: any
    ): void {
        if (prevProps.router.query.tags !== this.props.router.query.tags) {
            this.props.postsStore.resetPositionAndPosts()
            this.fetchWithTags(this.props.router.query.tags)
        }
    }

    async componentDidMount(): Promise<void> {
        this.fetchWithTags(this.props.router.query.tags)
    }

    private fetchWithTags = async tags => {
        await this.props.postsStore.getPostsForSubs(tags.split(','))
    }

    public render() {
        const { getPostsForSubs, postsPosition, posts } = this.props.postsStore
        const { cursorId, items } = postsPosition


        let hasMore = cursorId !== 0

        return (
            <InfiniteScrollFeed
                dataLength={items}
                hasMore={hasMore}
                next={getPostsForSubs}
                posts={posts}
            />
        )
    }
}

export default Tags
