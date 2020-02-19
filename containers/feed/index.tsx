import React, { useContext, useEffect, useMemo } from 'react'
import { InfiniteScrollFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, StoreContext } from '@stores'
import Empty from 'antd/lib/empty'
import Helmet from 'react-helmet'

const FeedPageNoSSR = observer(() => {
    const { postsStore, userStore, authStore }: RootStore = useContext(StoreContext)
    const postPub = useMemo(() => authStore.postPub, [])
    useEffect(() => {
        postsStore.resetPostsAndPosition()
        postsStore.getPostsForKeys(postPub, [...userStore.following.keys()])
    }, [])

    if (!postsStore.posts.length) {
        return <Empty description={<span>Follow some users to see their activity here!</span>} />
    }

    return (
        <InfiniteScrollFeed
            dataLength={postsStore.postsPosition.items}
            hasMore={postsStore.postsPosition.cursorId !== 0}
            next={() => postsStore.getPostsForKeys(postPub)}
            posts={postsStore.posts}
        />
    )
})

const FeedPage: React.FC<any> = () => {
    return (
        <>
            <Helmet>
                <title>Discussions App - #feed</title>
            </Helmet>
            <FeedPageNoSSR />
        </>
    )
}

export default observer(FeedPage)
