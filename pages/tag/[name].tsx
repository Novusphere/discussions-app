import React, { useContext } from 'react'
import { NextPage } from 'next'
import { InfiniteScrollFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { StoreContext } from '@stores'
import { parseCookies } from 'nookies'

const TagPage: NextPage<any> = ({ postPub, tag, pinnedByDelegation }) => {
    const { postsStore } = useContext(StoreContext)

    return (
        <InfiniteScrollFeed
            dataLength={postsStore.postsPosition.items}
            hasMore={postsStore.postsPosition.cursorId !== 0}
            next={() => postsStore.fetchPostsForTag(postPub, [tag], pinnedByDelegation)}
            posts={postsStore.posts}
        />
    )
}

TagPage.getInitialProps = async function({ store, query, ...rest }: any) {
    const tag = query.name
    const { pinnedByDelegation } = parseCookies(rest)
    store.postsStore.resetPostsAndPosition()

    const postPub = store.authStore.postPub
    await store.postsStore.fetchPostsForTag(postPub, [tag], pinnedByDelegation)

    return {
        postPub,
        tag,
        pinnedByDelegation,
    }
}

export default observer(TagPage)
