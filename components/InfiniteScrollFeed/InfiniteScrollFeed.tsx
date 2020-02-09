import React, { FunctionComponent, useCallback, useContext } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { PostPreview, VotingHandles } from '@components'
import { Post } from '@novuspherejs'
import { Button, Icon, Skeleton } from 'antd'

import Empty from 'antd/lib/empty'

import styles from './InfiniteScrollFeed.module.scss'

import { RootStore, StoreContext } from '@stores'
import { observer, useObserver } from 'mobx-react-lite'
import cx from 'classnames'
import { useRouter } from 'next/router'

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
    const { uiStore, authStore, userStore, tagStore }: RootStore = useContext(StoreContext)
    const router = useRouter()

    const renderEndMessage = useCallback(() => {
        return <div className={'tc pa3 f6 card bg-white'}>You have reached the end!</div>
    }, [])

    const renderLoadingMessage = useCallback(() => {
        return (
            <>
                {Array.from({ length: 5 }, (value, index) => (
                    <div key={index} className={'flex flex-row items-center bg-white mh1 mb3'}>
                        <div
                            className={cx([
                                'h-100 db bg-light-gray flex tc justify-center ph2 pv4 relative z-2 flex-auto',
                            ])}
                            style={{ height: '200px', width: '40px' }}
                        />
                        <Skeleton className={'ml3'} active />
                    </div>
                ))}
            </>
        )
    }, [])

    if (!posts.length && !hasMore) {
        return (
            <div className={'db center tc'}>
                <Empty description={<span>There doesn't seem to be anything here...</span>}>
                    <Button type="primary" onClick={() => router.push('/new', '/new')}>
                        Create a post now
                    </Button>
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
                          const tag = tagStore.tagModelFromObservables(post.sub)
                          if (!tag) return null
                          return (
                              <PostPreview
                                  key={`${post.uuid}-${post.pinned}`}
                                  post={post}
                                  tag={tag}
                                  showToast={uiStore.showToast}
                                  hasAccount={authStore.hasAccount}
                                  postPriv={authStore.postPriv}
                                  blockedByDelegation={userStore.blockedByDelegation}
                                  blockedContentSetting={userStore.blockedContentSetting}
                                  blockedPosts={userStore.blockedPosts}
                                  blockedUsers={userStore.blockedUsers}
                                  unsignedPostsIsSpam={userStore.unsignedPostsIsSpam}
                                  toggleBlockPost={userStore.toggleBlockPost}
                              />
                          )
                      })
                : children}
        </InfiniteScroll>
    )
}

InfiniteScrollFeed.defaultProps = {}

export default observer(InfiniteScrollFeed)
