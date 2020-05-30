import React, { useMemo, useState } from 'react'
import { useCallback } from 'react'
import { CommonFeed, UserNameWithIcon } from '@components'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import Helmet from 'react-helmet'
import { useParams } from 'react-router-dom'
import styles from '@containers/trending/styles.module.scss'
import { Button } from 'antd'
import { getIdenticon } from '@utils'

const SearchPage: React.FC<any> = () => {
    const { postsStore, userStore }: RootStore = useStores()
    const [usersSearch, setUserSearch] = useState<boolean | any[]>(false)
    const params = useParams()

    const decodedQuery = useMemo(() => decodeURIComponent(params['query']), [params])

    const fetch = ({ postPub, sort }) => {
        console.log(decodedQuery)

        if (decodedQuery.startsWith('@')) {
            const [, name] = decodedQuery.split('@')
            postsStore.fetchUserByString(name).then(users => {
                setUserSearch(users)
            })
        } else {
            setUserSearch(false)
            postsStore.getSearchResults(decodedQuery, postPub, sort)
        }
    }

    const { items, cursorId } = postsStore.postsPosition

    const renderShowResults = () => {
        if (typeof usersSearch === 'boolean') {
            return `Showing results for: "${decodedQuery}" (${postsStore.postsPosition.items}
                ${postsStore.postsPosition.items === 1 ? 'result' : 'results'})`
        }

        return `Showing results for: "${decodedQuery}" (${usersSearch.length} users)`
    }

    return (
        <>
            <Helmet>
                <title>{`Search results: ${decodedQuery}`}</title>
            </Helmet>
            <span className={'db mb3 f6'}>{renderShowResults()}</span>
            {usersSearch && Array.isArray(usersSearch) ? (
                usersSearch.map(user => {
                    return (
                        <div
                            key={user.pub}
                            className={
                                'card bg-white pa2 mb2 lh-copy flex flex-row items-center justify-between'
                            }
                        >
                            <span className={'flex flex-column'}>
                                <span className={'flex flex-row items-center w4'}>
                                    <UserNameWithIcon
                                        imageData={getIdenticon(user.pub)}
                                        pub={user.pub}
                                        name={user.displayName}
                                    />
                                </span>
                                <span className={'pv1'}>
                                    <span className={'flex flex-row items-center'}>
                                        <span className={'mr2'}>
                                            {user.followers} followers
                                        </span>
                                        <span className={'mr2'}>
                                            {user.posts} posts
                                        </span>
                                        <span className={'mr2'}>
                                            {user.threads} threads
                                        </span>
                                    </span>
                                    <span className={'f6 pv1 o-80'}>{user.pub}</span>
                                </span>
                            </span>
                            <span className={'w4 tr'}>
                                {userStore.following.has(user.pub) ? (
                                    <Button
                                        type={'default'}
                                        size={'default'}
                                        className={styles.button}
                                        onClick={() =>
                                            userStore.toggleUserFollowing(
                                                user.displayName,
                                                user.pub
                                            )
                                        }
                                    >
                                        Following
                                    </Button>
                                ) : (
                                    <Button
                                        type={'primary'}
                                        icon={'plus'}
                                        size={'default'}
                                        className={styles.button}
                                        onClick={() =>
                                            userStore.toggleUserFollowing(
                                                user.displayName,
                                                user.pub
                                            )
                                        }
                                    >
                                        Follow
                                    </Button>
                                )}
                            </span>
                        </div>
                    )
                })
            ) : (
                <CommonFeed
                    onFetch={fetch}
                    emptyDescription={'No results found for query'}
                    posts={postsStore.posts}
                    dataLength={items}
                    cursorId={cursorId}
                    tag={decodedQuery}
                />
            )}
        </>
    )
}

export default observer(SearchPage)
