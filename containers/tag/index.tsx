import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { InfiniteScrollFeed } from '@components'
import { RootStore, StoreContext } from '@stores'
import Helmet from 'react-helmet'
import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

const TagPage: React.FC<any> = () => {
    const { postsStore, userStore, authStore }: RootStore = useContext(StoreContext)
    const { tag } = useParams()
    const pinnedPosts = useMemo(() => [...userStore.pinnedPosts.toJS()], [])
    const postPub = useMemo(() => authStore.postPub, [])
    const fetch = useCallback(() => postsStore.fetchPostsForTag(postPub, [tag], pinnedPosts), [tag])

    useEffect(() => {
        postsStore.resetPostsAndPosition()
        fetch()
    }, [tag])

    return (
        <>
            <Helmet>
                <title>{`Discussions App - #${tag}`}</title>
            </Helmet>
            <InfiniteScrollFeed
                dataLength={postsStore.postsPosition.items}
                hasMore={postsStore.postsPosition.cursorId !== 0}
                next={fetch}
                posts={postsStore.posts}
            />
        </>
    )
}

export default observer(TagPage)
