import React, { useContext, useEffect, useMemo } from 'react'
import { InfiniteScrollFeed } from '@components'
import { useObserver } from 'mobx-react-lite'
import { StoreContext } from '@stores'
import Helmet from 'react-helmet'

const IndexPageNoSSR = () => {
    const { postsStore, tagStore, authStore } = useContext(StoreContext)
    const postPub = useMemo(() => authStore.postPub, [])

    useEffect(() => {
        postsStore.resetPostsAndPosition()
        postsStore.fetchPostsForTag(postPub, [...tagStore.subscribed.toJS()])
    }, [])

    return useObserver(() => (
        <InfiniteScrollFeed
            dataLength={postsStore.postsPosition.items}
            hasMore={postsStore.postsPosition.cursorId !== 0}
            next={() => postsStore.fetchPostsForTag(postPub)}
            posts={postsStore.posts}
        />
    ))
}

const IndexPage: React.FC<any> = ({ postPub }) => {
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
