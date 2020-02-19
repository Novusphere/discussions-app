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
        postsStore.resetPostsAndPosition()
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

export default observer(AllPage)
