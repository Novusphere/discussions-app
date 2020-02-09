import React, { useContext } from 'react'
import { NextPage } from 'next'
import { InfiniteScrollFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { StoreContext } from '@stores'
import Head from 'next/head'

const TagsPage: NextPage<any> = ({ postPub, split, tags }) => {
    const { postsStore } = useContext(StoreContext)

    return (
        <>
            <Head>
                <title>Discussions App - {tags}</title>
            </Head>
            <InfiniteScrollFeed
                dataLength={postsStore.postsPosition.items}
                hasMore={postsStore.postsPosition.cursorId !== 0}
                next={() => postsStore.fetchPostsForTag(postPub, split)}
                posts={postsStore.posts}
            />
        </>
    )
}

TagsPage.getInitialProps = async function({ store, query }: any) {
    let tags = query.tags
    let split = tags.split(',')
    store.postsStore.resetPostsAndPosition()

    const postPub = store.authStore.postPub
    await store.postsStore.fetchPostsForTag(postPub, split)

    split = split.map(tag => `#${tag}`)
    tags = split.join(',')

    return {
        tags,
        postPub,
        split,
    }
}

export default observer(TagsPage)
