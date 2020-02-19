import React, { useContext } from 'react'
import { InfiniteScrollFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { StoreContext } from '@stores'
import Helmet from 'react-helmet'

const TagsPage: React.FC<any> = ({ postPub, split, tags }) => {
    const { postsStore } = useContext(StoreContext)

    return (
        <>
            <Helmet>
                <title>{`Discussions App - ${tags}`}</title>
            </Helmet>
            <InfiniteScrollFeed
                dataLength={postsStore.postsPosition.items}
                hasMore={postsStore.postsPosition.cursorId !== 0}
                next={() => postsStore.fetchPostsForTag(postPub, split)}
                posts={postsStore.posts}
            />
        </>
    )
}

// TODO: Move this to useEffect
// TagsPage.getInitialProps = async function({ store, query }: any) {
//     let tags = query.tags
//     let split = tags.split(',')
//     store.postsStore.resetPostsAndPosition()
//
//     const postPub = store.authStore.postPub
//     await store.postsStore.fetchPostsForTag(postPub, split)
//
//     split = split.map(tag => `#${tag}`)
//     tags = split.join(',')
//
//     return {
//         tags,
//         postPub,
//         split,
//     }
// }

export default observer(TagsPage)
