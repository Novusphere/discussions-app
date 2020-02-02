import React, { useContext, useEffect, useState } from 'react'
import { NextPage } from 'next'
import { RootStoreContext } from '@stores'
import { InfiniteScrollFeed, PostPreview } from '@components'
import { observer } from 'mobx-react-lite'
import nookies from 'nookies'

const IndexPage: NextPage<any> = ({ posts, position, key }) => {
    const store = useContext(RootStoreContext)

    console.log(JSON.stringify(store.postsStore.postsPosition))

    return (
        <InfiniteScrollFeed
            dataLength={ store.postsStore.postsPosition.items}
            hasMore={ store.postsStore.postsPosition.cursorId !== 0}
            next={() => store.postsStore.fetchPostsForTag(key)}
            posts={posts}
        />
    )
}

IndexPage.getInitialProps = async function(ctx: any) {
    const key = nookies.get(ctx).postPub
    const { posts, position } = await ctx.store.postsStore.fetchPostsForTag(key)
    return {
        key,
        posts,
        position,
    }
}

export default observer(IndexPage)
