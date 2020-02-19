import React, { useContext, useEffect } from 'react'
import { InfiniteScrollFeed } from '@components'
import { useObserver } from 'mobx-react-lite'
import { StoreContext } from '@stores'
import Helmet from 'react-helmet'

const IndexPageNoSSR = ({ postPub }: any) => {
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
}

const IndexPage: React.FC<any> = ({ postPub }) => {
    return (
        <>
            <Helmet>
                <title>Discussions App</title>
            </Helmet>
            <IndexPageNoSSR postPub={postPub} />
        </>
    )
}

// TODO: Move this to useEffect
// IndexPage.getInitialProps = async function({ store }: any) {
//     const postPub = store.authStore.postPub
//     return {
//         postPub,
//     }
// }

export default IndexPage
