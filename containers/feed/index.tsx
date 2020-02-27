import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { InfiniteScrollFeed, Sorter } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, StoreContext } from '@stores'
import { Empty } from 'antd'
import Helmet from 'react-helmet'

const FeedPageNoSSR = observer(() => {
    const { postsStore, userStore, authStore }: RootStore = useContext(StoreContext)
    const [sort, setSort] = useState()
    const postPub = useMemo(() => authStore.postPub, [])
    const fetch = useCallback(
        (sort = '') => postsStore.getPostsForKeys(postPub, [...userStore.following.keys()], sort),
        []
    )

    const resetAndFetch = useCallback((sort = '') => {
        postsStore.resetPostsAndPosition()
        fetch(sort)
    }, [])

    useEffect(() => {
        resetAndFetch()
    }, [])


    if (!postsStore.posts.length) {
        return <Empty description={<span>Follow some users to see their activity here!</span>} />
    }

    return (
        <>
            <Sorter onChange={resetAndFetch} />
            <InfiniteScrollFeed
                dataLength={postsStore.postsPosition.items}
                hasMore={postsStore.postsPosition.cursorId !== 0}
                next={() => postsStore.getPostsForKeys(postPub)}
                posts={postsStore.posts}
            />
        </>
    )
})

const FeedPage: React.FC<any> = () => {
    return (
        <>
            <Helmet>
                <title>{`#feed`}</title>
            </Helmet>
            <FeedPageNoSSR />
        </>
    )
}

export default FeedPage
