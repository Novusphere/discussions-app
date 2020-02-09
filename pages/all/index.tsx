import React, { useContext } from 'react'
import { NextPage } from 'next'
import { InfiniteScrollFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { StoreContext } from '@stores'
import Head from 'next/head'
import { NextSeo } from 'next-seo'

const AllPage: NextPage<any> = ({ postPub }) => {
    const { postsStore } = useContext(StoreContext)
    const title = 'Discussions App - #all'

    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <NextSeo title={title} description={'Viewing all posts in #all'} />
            <InfiniteScrollFeed
                dataLength={postsStore.postsPosition.items}
                hasMore={postsStore.postsPosition.cursorId !== 0}
                next={() => postsStore.fetchPostsForTag(postPub, ['all'])}
                posts={postsStore.posts}
            />
        </>
    )
}

AllPage.getInitialProps = async function({ store }: any) {
    store.postsStore.resetPostsAndPosition()

    const postPub = store.authStore.postPub
    await store.postsStore.fetchPostsForTag(postPub, ['all'])

    return {
        postPub,
    }
}

export default observer(AllPage)
