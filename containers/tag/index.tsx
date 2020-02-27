import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { InfiniteScrollFeed, Sorter } from '@components'
import { RootStore, StoreContext } from '@stores'
import Helmet from 'react-helmet'
import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

const TagPage: React.FC<any> = () => {
    const { postsStore, userStore, authStore }: RootStore = useContext(StoreContext)
    const { tag } = useParams()
    const pinnedPosts = useMemo(() => [...userStore.pinnedPosts.toJS()], [])
    const postPub = useMemo(() => authStore.postPub, [])
    const fetch = useCallback(
        (sort = '') => postsStore.fetchPostsForTag(postPub, [tag], pinnedPosts, sort),
        [tag, pinnedPosts]
    )

    const resetAndFetch = useCallback((sort = '') => {
        postsStore.resetPostsAndPosition()
        fetch(sort)
    }, [])

    useEffect(() => {
        resetAndFetch()
    }, [tag])

    return (
        <>
            <Helmet>
                <title>{`#${tag}`}</title>
            </Helmet>
            <Sorter onChange={resetAndFetch} />
            <InfiniteScrollFeed
                dataLength={postsStore.postsPosition.items}
                hasMore={postsStore.postsPosition.cursorId !== 0}
                next={fetch}
                posts={postsStore.posts}
            />
        </>
    )
}

export default observer(TagPage)
