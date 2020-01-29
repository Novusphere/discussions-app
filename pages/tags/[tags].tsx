import * as React from 'react'
import { IStores } from '@stores'
import { Post } from '@novuspherejs'
import { inject, observer } from 'mobx-react'
import { InfiniteScrollFeed } from '@components'
import { NextRouter, withRouter } from 'next/router'

interface IAllProps {
    router: NextRouter
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
    tagStore: IStores['tagStore']
    posts: Post[]
    cursorId: number
}

interface IAllState {}

@(withRouter as any)
@inject('postsStore', 'uiStore', 'tagStore')
@observer
class Tags extends React.Component<IAllProps, IAllState> {
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
        this.props.uiStore.toggleSidebarStatus(true)
        this.props.uiStore.toggleBannerStatus(true)
        this.props.tagStore.destroyActiveTag()

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
