import React, { FunctionComponent, useCallback, useContext } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { PostPreview } from '@components'
import { Post } from '@novuspherejs'
import { Button } from 'antd'

import Empty from 'antd/lib/empty'

import styles from './InfiniteScrollFeed.module.scss'

import { StoreContext } from '@stores'

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
    const { uiStore, authStore, userStore, settingStore } = useContext(StoreContext)

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

    if (!posts.length) {
        return (
            <div className={'db center tc'}>
                <Empty description={<span>There doesn't seem to be anything here...</span>}>
                    <Button type="primary">Create a post now</Button>
                </Empty>
            </div>
        )
    }

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
                                  showToast={uiStore.showToast}
                                  hasAccount={authStore.hasAccount}
                                  postPriv={authStore.postPriv}
                                  voteHandler={post.vote}
                                  blockedByDelegation={userStore.blockedByDelegation}
                                  blockedContentSetting={settingStore.blockedContentSetting}
                                  blockedPosts={userStore.blockedPosts}
                                  blockedUsers={userStore.blockedUsers}
                                  unsignedPostsIsSpam={settingStore.unsignedPostsIsSpam}
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
