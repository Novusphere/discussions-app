import React, { useCallback } from 'react'
import { CommonFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import Helmet from 'react-helmet'

const FeedPage: React.FC<any> = () => {
    const { postsStore, userStore }: RootStore = useStores()
    const fetch = useCallback(
        ({ sort, postPub }) =>
            postsStore.getPostsForKeys(postPub, [...userStore.following.keys()], sort),
        []
    )

    const { items, cursorId } = postsStore.postsPosition

    return (
        <>
            <Helmet>
                <title>{`#feed`}</title>
            </Helmet>
            <CommonFeed
                onFetch={fetch}
                emptyDescription={'Follow some users to see their activity here!'}
                posts={postsStore.posts}
                dataLength={items}
                cursorId={cursorId}
            />
        </>
    )
}

export default observer(FeedPage)
