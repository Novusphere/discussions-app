import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { InfiniteScrollFeed } from '@components'
import { TagModel } from '@models/tagModel'
import Head from 'next/head'
import { Post } from '@novuspherejs'
import { sleep } from '@utils'

interface ITagProps {
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
    tagModel: TagModel

    tag: undefined | string
}

// TODO: Merge logic between e/page and tag/page. Right now it's separated.

interface ITagPageState {}

@inject('tagStore', 'postsStore', 'uiStore')
@observer
class Tag extends React.Component<ITagProps, ITagPageState> {
    state = {
        isFirstRender: false,
    }

    static async getInitialProps({ query, store }) {
        const postsStore: IStores['postsStore'] = store.postsStore
        const tagStore: IStores['tagStore'] = store.tagStore
        const tag = query.name

        tagStore.setActiveTag(tag)
        tagStore.setActiveSlug(tag)
        postsStore.resetPositionAndPosts()

        return {
            tag,
        }
    }

    componentWillMount(): void {
        this.props.uiStore.toggleBannerStatus(true)
        this.props.uiStore.toggleSidebarStatus(true)
    }

    async componentDidMount(): Promise<void> {
        window.scrollTo(0, 0)
        if (!this.state.isFirstRender) {
            this.props.tagStore.setActiveTag(this.props.tag)
            this.props.tagStore.setActiveSlug(this.props.tag)

            await sleep(500)
            await this.props.postsStore.getPostsByTag([this.props.tag], true)

            this.setState({
                isFirstRender: true,
            })
        }
    }

    componentWillUnmount(): void {
        this.props.tagStore.destroyActiveTag()
    }

    public render() {
        const {
            props: {
                postsStore: { posts, postsPosition, getPostsByTag },
                tagStore,
                tag,
            },
        } = this

        return (
            <>
                <Head>
                    <title>{tag}</title>
                </Head>
                <InfiniteScrollFeed
                    dataLength={postsPosition.items}
                    hasMore={postsPosition.cursorId !== 0}
                    next={() => getPostsByTag([tag])}
                    posts={posts}
                    tagModel={tagStore.activeTag}
                />
            </>
        )
    }
}

export default Tag
