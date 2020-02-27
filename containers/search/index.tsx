import * as React from 'react'
import { useCallback } from 'react'
import { CommonFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import Helmet from 'react-helmet'
import { useParams } from 'react-router-dom'

const SearchPage: React.FC<any> = () => {
    const { postsStore }: RootStore = useStores()
    const { query } = useParams()
    const fetch = useCallback(
        ({ postPub, sort }) => postsStore.getSearchResults(query, postPub, sort),
        [query]
    )

    const { items, cursorId } = postsStore.postsPosition

    return (
        <>
            <Helmet>
                <title>{`Search results: ${query}`}</title>
            </Helmet>
            <span className={'db mb3 f6'}>
                Showing results for: "{query}" ({postsStore.postsPosition.items}{' '}
                {postsStore.postsPosition.items === 1 ? 'result' : 'results'})
            </span>
            <CommonFeed
                onFetch={fetch}
                emptyDescription={'No results found for query'}
                posts={postsStore.posts}
                dataLength={items}
                cursorId={cursorId}
                tag={query}
            />
        </>
    )
}

export default observer(SearchPage)
