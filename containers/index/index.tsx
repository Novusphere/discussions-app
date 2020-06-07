import React, { useCallback } from 'react'
import { CommonFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import Helmet from 'react-helmet'

const IndexPage: React.FC<any> = () => {
    const { postsStore, tagStore }: RootStore = useStores()
    const fetch = useCallback(
        ({ postPub, sort }) =>
            postsStore.fetchPostsForTag({
                key: postPub,
                tagNames: [...tagStore.subscribed],
                sort: sort
            }),
        []
    )

    const { items, cursorId } = postsStore.postsPosition

    return (
        <>
            <Helmet>
                <title>{`Discussions App`}</title>
            </Helmet>
            <CommonFeed
                onFetch={fetch}
                emptyDescription={'There are no posts currently'}
                posts={postsStore.posts}
                dataLength={items}
                cursorId={cursorId}
            />
        </>
    )
}

export default observer(IndexPage)
