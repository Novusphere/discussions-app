import React, { useContext, useEffect, useMemo } from 'react'
import { NextPage } from 'next'
import { InfiniteScrollFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, StoreContext } from '@stores'
import { NextSeo } from 'next-seo'
import Head from 'next/head'
import dynamic from 'next/dynamic'

const TagPageObservable: NextPage<any> = ({ tag }) => {
    const { postsStore, userStore, authStore }: RootStore = useContext(StoreContext)

    const pinnedPosts = useMemo(() => [...userStore.pinnedPosts.toJS()], [])
    const postPub = useMemo(() => authStore.postPub, [])

    useEffect(() => {
        postsStore.resetPostsAndPosition()
        postsStore.fetchPostsForTag(postPub, [tag], pinnedPosts)
    }, [])

    return (
        <>
            <Head>
                <title>Discussions App - #{tag}</title>
            </Head>
            <NextSeo title={`Discussions App - #${tag}`} description={`Viewing posts in #${tag}`} />
            <InfiniteScrollFeed
                dataLength={postsStore.postsPosition.items}
                hasMore={postsStore.postsPosition.cursorId !== 0}
                next={() => postsStore.fetchPostsForTag(postPub, [tag], pinnedPosts)}
                posts={postsStore.posts}
            />
        </>
    )
}

const TagPage = observer(TagPageObservable) as any

TagPage.getInitialProps = async function({ store, query }: any) {
    const tag = query.name
    // store.postsStore.resetPostsAndPosition()
    // const pinnedPosts = store.userStore.pinnedPosts
    // const postPub = store.authStore.postPub
    // await store.postsStore.fetchPostsForTag(postPub, [tag], pinnedPosts)
    //
    // console.log({
    //     pinnedPosts,
    //     postPub,
    //     tag,
    // })

    return {
        // postPub,
        tag,
        // pinnedPosts,
    }
}
export default TagPage
//
// export default dynamic(() => Promise.resolve(TagPage), {
//     ssr: false,
// })
