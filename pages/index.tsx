import React, { useContext, useEffect } from 'react'
import { NextPage } from 'next'
import { InfiniteScrollFeed } from '@components'
import { observer, useObserver } from 'mobx-react-lite'
import nookies from 'nookies'
import { StoreContext, useStores } from '@stores'

const IndexPage: NextPage<any> = ({ postPub }) => {
    const { postsStore, userStore } = useContext(StoreContext)

    return (
        <InfiniteScrollFeed
            dataLength={postsStore.postsPosition.items}
            hasMore={postsStore.postsPosition.cursorId !== 0}
            next={() => postsStore.fetchPostsForTag(postPub)}
            posts={postsStore.posts}
        />
    )
}

IndexPage.getInitialProps = async function(ctx: any) {
    ctx.store.postsStore.resetPostsAndPosition()

    const postPub = ctx.store.authStore.postPub
    await ctx.store.postsStore.fetchPostsForTag(postPub)

    return {
        postPub,
    }
}

export default observer(IndexPage)
