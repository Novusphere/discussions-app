import React, { useCallback, useMemo } from 'react'
import { CommonFeed } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import Helmet from 'react-helmet'
import { useParams } from 'react-router-dom'

const TagsPage: React.FC<any> = () => {
    const { postsStore }: RootStore = useStores()
    const { tags } = useParams()
    const split = useMemo(() => tags.toLowerCase().split(','), [tags])
    const fetch = useCallback(
        ({ postPub, sort }) => postsStore.fetchPostsForTag(postPub, split, [], sort),
        [split]
    )

    const { items, cursorId } = postsStore.postsPosition

    return (
        <>
            <Helmet>
                <title>{`${split.map(tag => `#${tag}`)}`}</title>
            </Helmet>
            <CommonFeed
                onFetch={fetch}
                emptyDescription={'There are no posts currently'}
                posts={postsStore.posts}
                dataLength={items}
                cursorId={cursorId}
                tag={tags}
            />
        </>
    )
}

export default observer(TagsPage)
