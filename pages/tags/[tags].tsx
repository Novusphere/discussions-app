import React, { useContext } from 'react'
import { NextPage } from 'next'
import { InfiniteScrollFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { StoreContext } from '@stores'

const TagsPage: NextPage<any> = ({ postPub, split }) => {
    const { postsStore } = useContext(StoreContext)

    return (
        <InfiniteScrollFeed
            dataLength={postsStore.postsPosition.items}
            hasMore={postsStore.postsPosition.cursorId !== 0}
            next={() => postsStore.fetchPostsForTag(postPub, split)}
            posts={postsStore.posts}
        />
    )
}

TagsPage.getInitialProps = async function({ store, query }: any) {
    const tags = query.tags
    const split = tags.split(',')
    store.postsStore.resetPostsAndPosition()

    const postPub = store.authStore.postPub
    await store.postsStore.fetchPostsForTag(postPub, split)

    return {
        postPub,
        split,
    }
}

export default observer(TagsPage)
