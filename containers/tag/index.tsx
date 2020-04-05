import React, { useCallback, useMemo } from 'react'
import { CommonFeed } from '@components'
import { RootStore, useStores } from '@stores'
import Helmet from 'react-helmet'
import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

const TagPage: React.FC<any> = () => {
    const { postsStore, userStore }: RootStore = useStores()
    const { tag: paramTag } = useParams()
    const tag = useMemo(() => paramTag.toLowerCase(), [paramTag])
    const pinnedPosts = [...userStore.pinnedPosts.toJS(), ...userStore.pinnedByDelegation.toJS()]

    const fetch = useCallback(
        ({ sort, postPub }) => {
            postsStore.fetchPostsForTag(postPub, [tag], pinnedPosts, sort)
        },
        [tag, pinnedPosts]
    )

    const { items, cursorId } = postsStore.postsPosition

    return (
        <>
            <Helmet>
                <title>{`#${tag}`}</title>
            </Helmet>
            <CommonFeed
                onFetch={fetch}
                emptyDescription={'There are currently no posts in this tag.'}
                posts={postsStore.posts}
                dataLength={items}
                cursorId={cursorId}
                tag={tag}
            />
        </>
    )
}

export default observer(TagPage)
