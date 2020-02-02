import React, { FunctionComponent, useCallback, useContext } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { PostPreview } from '@components'
import { Post } from '@novuspherejs'

import styles from './InfiniteScrollFeed.module.scss'
import { RootStoreContext } from '@stores'
import { observer } from 'mobx-react-lite'

interface IInfiniteScrollFeedProps {
    dataLength: number
    hasMore: boolean
    next: () => void
    posts: Post[]

    withAnchorUid?: boolean
    tagModel?: any
}

const InfiniteScrollFeed: FunctionComponent<IInfiniteScrollFeedProps> = ({
    dataLength,
    hasMore,
    next,
    posts,
    children,
}) => {
    const store = useContext(RootStoreContext)

    const renderEndMessage = useCallback(() => {
        return (
            <div className={'bg-white tc pa3'}>
                <span className={'f6'}>You have reached the end!</span>
            </div>
        )
    }, [])

    const renderLoadingMessage = useCallback(() => {
        return (
            <div className={'bg-white tc pa3'}>
                <span className={'f6'}>Loading...</span>
            </div>
        )
    }, [])

    return (
        <InfiniteScroll
            dataLength={dataLength}
            next={next}
            hasMore={hasMore}
            loader={renderLoadingMessage()}
            endMessage={renderEndMessage()}
        >
            {!children
                ? posts
                      .filter(post => post.transaction)
                      .map(post => {
                          return (
                              <PostPreview
                                  key={post.uuid}
                                  post={post}
                                  tokenImages={[]}
                                  tag={null}
                                  showToast={store.uiStore.showToast}
                                  hasAccount={store.authStore.hasAccount}
                                  postPriv={store.authStore.postPriv}
                                  voteHandler={post.vote}
                                  blockedByDelegation={store.userStore.blockedByDelegation}
                                  blockedContentSetting={store.settingStore.blockedContentSetting}
                                  blockedPosts={store.userStore.blockedPosts}
                                  blockedUsers={store.userStore.blockedUsers}
                                  unsignedPostsIsSpam={store.settingStore.unsignedPostsIsSpam}
                                  toggleBlockPost={null}
                              />
                          )
                      })
                : children}
        </InfiniteScroll>
    )
}

InfiniteScrollFeed.defaultProps = {}

export default InfiniteScrollFeed
