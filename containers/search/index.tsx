import * as React from 'react'
import { useContext } from 'react'
import { StoreContext } from '@stores'
import { InfiniteScrollFeed } from '@components'
import { useObserver } from 'mobx-react-lite'
import Helmet from 'react-helmet'

const SearchPage: React.FC<any> = ({ query, postPub }) => {
    const { postsStore } = useContext(StoreContext)

    return useObserver(() => (
        <>
            <Helmet>
                <title>Discussions App - Searching: {query}</title>
            </Helmet>
            <span className={'db mb3 f6'}>
                Showing results for: "{query}" ({postsStore.postsPosition.items}{' '}
                {postsStore.postsPosition.items === 1 ? 'result' : 'results'})
            </span>
            <InfiniteScrollFeed
                withAnchorUid
                dataLength={postsStore.postsPosition.items}
                hasMore={postsStore.postsPosition.cursorId !== 0}
                next={() => postsStore.getSearchResults(query, postPub)}
                posts={postsStore.posts}
            />
        </>
    ))
}

// TODO: Move this to useEffect
// SearchPage.getInitialProps = async ({ query, store, ...rest }: any) => {
//     const searchQuery: string = query.search
//
//     store.postsStore.resetPostsAndPosition()
//
//     const postPub = store.authStore.postPub
//     await store.postsStore.getSearchResults(searchQuery, postPub)
//
//     return {
//         postPub,
//         query: searchQuery,
//     }
// }

export default SearchPage
