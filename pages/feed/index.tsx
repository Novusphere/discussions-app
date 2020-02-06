import React, { useContext, useEffect } from 'react'
import { NextPage } from 'next'
import { InfiniteScrollFeed } from '@components'
import { observer, useObserver } from 'mobx-react-lite'
import { RootStore, StoreContext } from '@stores'
import dynamic from 'next/dynamic'

const FeedPageNoSSR = dynamic(
    () =>
        Promise.resolve(({ postPub }: any) => {
            const { postsStore, userStore }: RootStore = useContext(StoreContext)

            useEffect(() => {
                postsStore.resetPostsAndPosition()
                postsStore.getPostsForKeys(postPub, [...userStore.following.keys()])
            }, [])

            return useObserver(() => (
                <InfiniteScrollFeed
                    dataLength={postsStore.postsPosition.items}
                    hasMore={postsStore.postsPosition.cursorId !== 0}
                    next={() => postsStore.getPostsForKeys(postPub)}
                    posts={postsStore.posts}
                />
            ))
        }),
    {
        ssr: false,
    }
)

const FeedPage: NextPage<any> = ({ postPub }) => {
    return <FeedPageNoSSR postPub={postPub} />
}

FeedPage.getInitialProps = async function(ctx: any) {
    const postPub = ctx.store.authStore.postPub

    return {
        postPub,
    }
}

export default observer(FeedPage)
