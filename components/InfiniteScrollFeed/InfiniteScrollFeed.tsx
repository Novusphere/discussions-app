import React, { FunctionComponent, useCallback, useContext } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { PostPreview } from '@components'
import { Post } from '@novuspherejs'
import { Button, Icon, Skeleton } from 'antd'

import Empty from 'antd/lib/empty'

import styles from './InfiniteScrollFeed.module.scss'

import { StoreContext } from '@stores'
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
    const { uiStore, authStore, userStore, settingStore, tagStore } = useContext(StoreContext)

    const renderEndMessage = useCallback(() => {
        return <div className={'tc pa3 f6 card bg-white'}>You have reached the end!</div>
    }, [])

    const renderLoadingMessage = useCallback(() => {
        return (
            <>
                <div className={'bg-white br3 pa3 mb3'}>
                    <Skeleton active />
                </div>
                <div className={'bg-white br3 pa3 mb3'}>
                    <Skeleton active />
                </div>
                <div className={'bg-white br3 pa3 mb3'}>
                    <Skeleton active />
                </div>
                <div className={'bg-white br3 pa3 mb3'}>
                    <Skeleton active />
                </div>
            </>
        )
    }, [])

    // if (!posts.length && !hasMore) {
    //     return (
    //         <div className={'db center tc'}>
    //             <Empty description={<span>There doesn't seem to be anything here...</span>}>
    //                 <Button type="primary">Create a post now</Button>
    //             </Empty>
    //         </div>
    //     )
    // }

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
                          const tag = tagStore.tagModelFromObservables(post.sub)
                          return (
                              <PostPreview
                                  key={`${post.uuid}-${post.pinned}`}
                                  post={post}
                                  tokenImages={[]}
                                  tag={tag}
                                  showToast={uiStore.showToast}
                                  hasAccount={authStore.hasAccount}
                                  postPriv={authStore.postPriv}
                                  voteHandler={post.vote}
                                  blockedByDelegation={userStore.blockedByDelegation}
                                  blockedContentSetting={settingStore.blockedContentSetting}
                                  blockedPosts={userStore.blockedPosts}
                                  blockedUsers={userStore.blockedUsers}
                                  unsignedPostsIsSpam={settingStore.unsignedPostsIsSpam}
                                  toggleBlockPost={userStore.toggleBlockPost}
                              />
                          )
                      })
                : children}
        </InfiniteScroll>
    )
}

InfiniteScrollFeed.defaultProps = {}

export default InfiniteScrollFeed
