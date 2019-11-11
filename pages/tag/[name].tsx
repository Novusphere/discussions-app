import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { InfiniteScrollFeed } from '@components'
import { TagModel } from '@models/tagModel'
import Head from 'next/head'

interface ITagProps {
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
    tagName: undefined | string
    tagModel: TagModel
}

// TODO: Merge logic between e/page and tag/page. Right now it's separated.

interface ITagPageState {}

@inject('tagStore', 'postsStore', 'uiStore')
@observer
class Tag extends React.Component<ITagProps, ITagPageState> {
    static async getInitialProps({ query, store }) {
        const postsStore: IStores['postsStore'] = store.postsStore
        postsStore.resetPositionAndPosts()

        const tag = query.name
        await postsStore.getPostsByTag([tag])

        return {
            tagName: tag,
        }
    }

    componentWillMount(): void {
        this.props.tagStore.setActiveTag(this.props.tagName)
        this.props.uiStore.toggleBannerStatus(true)
        this.props.uiStore.toggleSidebarStatus(true)
    }

    componentDidMount(): void {
        window.scrollTo(0, 0)
    }

    componentWillUnmount(): void {
        this.props.postsStore.resetPositionAndPosts()
    }


    public render() {
        const {
            props: {
                postsStore: { posts, postsPosition, getPostsByTag },
                tagStore,
                tagName,
            },
        } = this

        return (
            <>
                <Head>
                    <title>{tagName}</title>
                </Head>
                <InfiniteScrollFeed
                    dataLength={postsPosition.items}
                    hasMore={postsPosition.cursorId !== 0}
                    next={() => getPostsByTag([tagName])}
                    posts={posts}
                    tagModel={tagStore.activeTag}
                />
            </>
        )
    }
}

export default Tag
