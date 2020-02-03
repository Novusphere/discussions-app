import React, { useContext } from 'react'
import { NextPage } from 'next'
// import { RootStoreContext } from '@stores'
import { InfiniteScrollFeed } from '@components'
import { observer } from 'mobx-react-lite'
import nookies from 'nookies'
import { StoreContext } from '@stores'

const FeedPage: NextPage<any> = ({ postPub }) => {
    const { postsStore } = useContext(StoreContext)

    return (
        <InfiniteScrollFeed
            dataLength={postsStore.postsPosition.items}
            hasMore={postsStore.postsPosition.cursorId !== 0}
            next={() => postsStore.getPostsForKeys(postPub)}
            posts={postsStore.posts}
        />
    )
}

FeedPage.getInitialProps = async function(ctx: any) {
    ctx.store.postsStore.resetPostsAndPosition()

    const postPub = ctx.store.authStore.postPub
    await ctx.store.postsStore.getPostsForKeys(postPub)

    return {
        postPub,
    }
}

export default observer(FeedPage)
