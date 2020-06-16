import React, { FunctionComponent, useCallback, useContext } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { PostPreview, PostPreviewLoading } from '@components'
import { Post } from '@novuspherejs'
import { Button } from 'antd'

import Empty from 'antd/lib/empty'

import styles from './InfiniteScrollFeed.module.scss'

import { RootStore, StoreContext } from '@stores'
import { observer } from 'mobx-react-lite'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'

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
    const isMobile = useMediaQuery({ maxWidth: 767 })
    const { uiStore, authStore, userStore, tagStore }: RootStore = useContext(StoreContext)
    const history = useHistory()
    const renderEndMessage = useCallback(() => {
        return <div className={'tc pa3 f6 card bg-white'}>You have reached the end!</div>
    }, [])

    const renderLoadingMessage = useCallback(() => {
        return (
            <>
                {Array.from({ length: 5 }, (value, index) => (
                    <PostPreviewLoading key={index} />
                ))}
            </>
        )
    }, [])

    if (!posts.length && !hasMore) {
        return (
            <div className={'db center tc'}>
                <Empty description={<span>There doesn't seem to be anything here...</span>}>
                    <Button type="primary" onClick={() => history.push('/new')}>
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
            className={cx([
                {
                    mh1: isMobile,
                },
            ])}
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
                                  postPub={authStore.postPub}
                                  blockedContentSetting={userStore.blockedContentSetting}
                                  nsfwContentSetting={userStore.nsfwContentSetting}
                                  blockedUsers={userStore.blockedUsers}
                                  unsignedPostsIsSpam={userStore.unsignedPostsIsSpam}
                                  toggleModPolicy={userStore.setModPolicyAsync}
                              />
                          )
                      })
                : children}
        </InfiniteScroll>
    )
}

InfiniteScrollFeed.defaultProps = {}

export default observer(InfiniteScrollFeed)
