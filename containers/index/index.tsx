import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { InfiniteScrollFeed, Sorter } from '@components'
import { useObserver } from 'mobx-react-lite'
import { StoreContext } from '@stores'
import Helmet from 'react-helmet'

const IndexPageNoSSR = () => {
    const { postsStore, tagStore, authStore } = useContext(StoreContext)
    const postPub = useMemo(() => authStore.postPub, [])
    const fetch = useCallback(
        (sort = '') =>
            postsStore.fetchPostsForTag(postPub, [...tagStore.subscribed.toJS()], [], sort),
        []
    )

    const resetAndFetch = useCallback((sort = '') => {
        postsStore.resetPostsAndPosition()
        fetch(sort)
    }, [])

    useEffect(() => {
        resetAndFetch()
    }, [])

    return useObserver(() => (
        <>
            <Sorter onChange={resetAndFetch} />
            <InfiniteScrollFeed
                dataLength={postsStore.postsPosition.items}
                hasMore={postsStore.postsPosition.cursorId !== 0}
                next={() => postsStore.fetchPostsForTag(postPub)}
                posts={postsStore.posts}
            />
        </>
    ))
}

const IndexPage: React.FC<any> = () => {
    return (
        <>
            <Helmet>
                <title>{`Discussions App`}</title>
            </Helmet>
            <IndexPageNoSSR />
        </>
    )
}

export default IndexPage
