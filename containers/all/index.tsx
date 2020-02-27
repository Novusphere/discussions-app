import React, { useCallback, useContext, useEffect } from 'react'
import { InfiniteScrollFeed, Sorter } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, StoreContext } from '@stores'
import Helmet from 'react-helmet'

const AllPage: React.FC<any> = () => {
    const { postsStore, authStore }: RootStore = useContext(StoreContext)
    const fetch = useCallback(
        (sort = '') => postsStore.fetchPostsForTag(authStore.postPub, ['all'], [], sort),
        []
    )

    const resetAndFetch = useCallback((sort = '') => {
        postsStore.resetPostsAndPosition()
        fetch(sort)
    }, [])

    useEffect(() => {
        resetAndFetch()
    }, [])

    return (
        <>
            <Helmet>
                <title>{`#all`}</title>
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

export default observer(AllPage)
