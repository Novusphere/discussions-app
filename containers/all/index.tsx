import React, { useCallback } from 'react'
import { CommonFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import Helmet from 'react-helmet'

const AllPage: React.FC<any> = () => {
    const { postsStore }: RootStore = useStores()
    const fetch = useCallback(
        ({ sort, postPub }) => postsStore.fetchPostsForTag(postPub, ['all'], [], sort),
        []
    )

    const { items, cursorId } = postsStore.postsPosition

    return (
        <>
            <Helmet>
                <title>{`#all`}</title>
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

export default observer(AllPage)
