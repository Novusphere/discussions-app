import React, { useContext, useEffect } from 'react'
import { InfiniteScrollFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, StoreContext } from '@stores'
import Empty from 'antd/lib/empty'
import Helmet from 'react-helmet'

const FeedPageNoSSR = observer(({ postPub }: any) => {
    const { postsStore, userStore }: RootStore = useContext(StoreContext)

    useEffect(() => {
        postsStore.resetPostsAndPosition()
        postsStore.getPostsForKeys(postPub, [...userStore.following.keys()])
    }, [])

    if (!postsStore.posts.length) {
        return (
            <Empty
                description={<span>Follow some users to see their activity here!</span>}
            />
        )
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

const FeedPage: React.FC<any> = ({ postPub }) => {
    return (
        <>
            <Helmet>
                <title>Discussions App - #feed</title>
            </Helmet>
            <FeedPageNoSSR postPub={postPub} />
        </>
    )
}

// TODO: Move this to useEffect
// FeedPage.getInitialProps = async function(ctx: any) {
//     const postPub = ctx.store.authStore.postPub
//
//     return {
//         postPub,
//     }
// }

export default observer(FeedPage)
