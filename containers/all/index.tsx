import React, { useCallback, useContext, useEffect } from 'react'
import { InfiniteScrollFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, StoreContext } from '@stores'
import Helmet from 'react-helmet'

const AllPage: React.FC<any> = () => {
    const { postsStore, authStore }: RootStore = useContext(StoreContext)
    const title = 'Discussions App - #all'

    const fetch = useCallback(() => postsStore.fetchPostsForTag(authStore.postPub, ['all']), [])

    useEffect(() => {
        fetch()
    }, [])

    return (
        <>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <InfiniteScrollFeed
                dataLength={postsStore.postsPosition.items}
                hasMore={postsStore.postsPosition.cursorId !== 0}
                next={fetch}
                posts={postsStore.posts}
            />
        </>
    )
}

// TODO: Move this to useEffect
// AllPage.getInitialProps = async function({ store }: any) {
//     store.postsStore.resetPostsAndPosition()
//
//     const postPub = store.authStore.postPub
//     await store.postsStore.fetchPostsForTag(postPub, ['all'])
//
//     return {
//         postPub,
//     }
// }

export default observer(AllPage)
