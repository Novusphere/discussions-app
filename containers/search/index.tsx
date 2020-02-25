import * as React from 'react'
import { useCallback, useContext, useEffect, useMemo } from 'react'
import { StoreContext } from '@stores'
import { InfiniteScrollFeed } from '@components'
import { useObserver } from 'mobx-react-lite'
import Helmet from 'react-helmet'
import { useParams } from 'react-router-dom'

const SearchPage: React.FC<any> = () => {
    const { postsStore, authStore } = useContext(StoreContext)
    const postPub = useMemo(() => authStore.postPub, [])
    const { query } = useParams()
    const fetch = useCallback(() => postsStore.getSearchResults(query, postPub), [query, postPub])

    useEffect(() => {
        postsStore.resetPostsAndPosition()
        fetch()
    }, [query])

    return useObserver(() => (
        <>
            <Helmet>
                <title>{`Search results: ${query}`}</title>
            </Helmet>
            <span className={'db mb3 f6'}>
                Showing results for: "{query}" ({postsStore.postsPosition.items}{' '}
                {postsStore.postsPosition.items === 1 ? 'result' : 'results'})
            </span>
            <InfiniteScrollFeed
                withAnchorUid
                dataLength={postsStore.postsPosition.items}
                hasMore={postsStore.postsPosition.cursorId !== 0}
                next={fetch}
                posts={postsStore.posts}
            />
        </>
    ))
}

export default SearchPage
