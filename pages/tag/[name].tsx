import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { IPost } from '@stores/posts'
import { InfiniteScrollFeed } from '@components'
import { TagModel } from '@models/tagModel'
import FeedModel from '@models/feedModel'
import { pushToThread } from '@utils'
import Head from 'next/head'

interface ITagProps {
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    tagName: undefined | string
    tagModel: TagModel
    feed: FeedModel[]
}

// TODO: Merge logic between e/page and tag/page. Right now it's separated.

interface ITagPageState {
    feed: any[]
}

@inject('tagStore', 'postsStore')
@observer
class Tag extends React.Component<ITagProps, ITagPageState> {
    static async getInitialProps({ query, store }) {
        const tag = query.name
        const postsStore: IStores['postsStore'] = store.postsStore
        const tagStore: IStores['tagStore'] = store.tagStore

        const uiStore: IStores['uiStore'] = store.uiStore
        uiStore.toggleBannerStatus(true)
        uiStore.toggleSidebarStatus(true)

        let feed: any[] = []

        if (!tagStore.activeTag) {
            console.log('here 1')
            feed = await postsStore.getPostsByTag([tag])
        }

        if (tagStore.activeTag && tagStore.activeTag.name === tag) {
            console.log('here 2')
            feed = postsStore.posts
        }

        if (tagStore.activeTag && tagStore.activeTag.name !== tag) {
            console.log('here 3')
            postsStore.resetPositionAndPosts()
            tagStore.setActiveTag(tag)

            feed = await postsStore.getPostsByTag([tag])
        }

        return {
            tagName: tag,
            feed: feed,
        }
    }

    constructor(props) {
        super(props)

        this.state = {
            feed: props.feed,
        }
    }

    private getMorePosts = async () => {
        const feed = await this.props.postsStore.getPostsByTag([this.props.tagName])

        this.setState({
            feed,
        })
    }

    componentWillMount(): void {
        this.props.tagStore.setActiveTag(this.props.tagName)
    }

    public clickPost = (post: IPost) => {
        pushToThread(post)
    }

    public render() {
        const { feed } = this.state

        const {
            clickPost,
            props: {
                postsStore: { postsPosition },
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
                    next={this.getMorePosts}
                    posts={feed}
                    postOnClick={clickPost}
                    tagModel={tagStore.activeTag}
                />
            </>
        )
    }
}

export default Tag
