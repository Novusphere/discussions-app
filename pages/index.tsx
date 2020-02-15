import React, { useContext, useEffect } from 'react'
import { NextPage } from 'next'
import { InfiniteScrollFeed } from '@components'
import { observer, useObserver } from 'mobx-react-lite'
import { StoreContext } from '@stores'
import dynamic from 'next/dynamic'
import Head from 'next/head'

const IndexPageNoSSR = dynamic(
    () =>
        Promise.resolve(({ postPub }: any) => {
            const { postsStore, tagStore } = useContext(StoreContext)

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
        }),
    {
        ssr: false,
    }
)

const IndexPage: NextPage<any> = ({ postPub }) => {
    return (
        <>
            <Head>
                <title>Discussions App</title>
            </Head>
            <IndexPageNoSSR postPub={postPub} />
        </>
    )
}

IndexPage.getInitialProps = async function({ store }: any) {
    const postPub = store.authStore.postPub
    return {
        postPub,
    }
}

export default IndexPage
