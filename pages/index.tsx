import React, { useContext } from 'react'
import { NextPage } from 'next'
import { RootStoreContext } from '@stores'
import { InfiniteScrollFeed } from '@components'
import { observer } from 'mobx-react-lite'
import nookies from 'nookies'

const IndexPage: NextPage<any> = ({ key }) => {
    const store = useContext(RootStoreContext)

    return (
        <InfiniteScrollFeed
            dataLength={store.postsStore.postsPosition.items}
            hasMore={store.postsStore.postsPosition.cursorId !== 0}
            next={() => store.postsStore.fetchPostsForTag(key)}
            posts={store.postsStore.posts}
        />
    )
}

IndexPage.getInitialProps = async function(ctx: any) {
    const key = nookies.get(ctx).postPub
    ctx.store.postsStore.resetPostsAndPosition()
    const { posts, position } = await ctx.store.postsStore.fetchPostsForTag(key)
    return {
        key,
        posts,
        position,
    }
}

export default observer(IndexPage)
