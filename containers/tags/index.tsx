import React, { useCallback, useEffect, useMemo } from 'react'
import { InfiniteScrollFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import Helmet from 'react-helmet'
import { useParams } from 'react-router-dom'

const TagsPage: React.FC<any> = () => {
    const { postsStore, authStore }: RootStore = useStores()
    const postPub = useMemo(() => authStore.postPub, [])
    const { tags } = useParams()
    const split = useMemo(() => tags.split(','), [tags])
    const fetch = useCallback(() => postsStore.fetchPostsForTag(postPub, split), [postPub, split])

    useEffect(() => {
        postsStore.resetPostsAndPosition()
        fetch()
    }, [split])

    return (
        <>
            <Helmet>
                <title>{`${split.map(tag => `#${tag}`)}`}</title>
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

export default observer(TagsPage)
