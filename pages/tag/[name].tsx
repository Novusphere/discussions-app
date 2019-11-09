import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import posts, { IPost } from '@stores/posts'
import { Feed } from '@components'
import { TagModel } from '@models/tagModel'
import FeedModel from '@models/feedModel'
import { pushToThread } from '@utils'
import Head from 'next/head'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface ITagProps {
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    tagName: undefined | string
    tagModel: TagModel
    feed: FeedModel[]
}

// TODO: Merge logic between e/page and tag/page. Right now it's separated.

@inject('tagStore', 'postsStore')
@observer
class Tag extends React.Component<ITagProps> {
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

    componentWillMount(): void {
        this.props.tagStore.setActiveTag(this.props.tagName)
    }

    public clickPost = (post: IPost) => {
        pushToThread(post)
    }

    public render() {
        const {
            clickPost,
            props: { postsStore, tagStore, feed, tagName },
        } = this
        
        return (
            <>
                <Head>
                    <title>
                        {tagName}
                    </title>
                </Head>
                <Feed
                    threads={feed}
                    onClick={clickPost}
                    tagModel={tagStore.activeTag}
                />
            </>
        )
    }
}

export default Tag
