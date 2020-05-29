import React, { useState } from 'react'
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
    let { query } = useParams()
    query = decodeURIComponent(query)

    const fetch = useCallback(
        ({ postPub, sort }) => {
            if (query.startsWith('@')) {
                const [, name] = query.split('@')
                postsStore.fetchUserByString(name).then(users => {
                    setUserSearch(users)
                })
            } else {
                setUserSearch(false)
            }
            return postsStore.getSearchResults(query, postPub, sort)
        },
        [query]
    )

    const { items, cursorId } = postsStore.postsPosition

    const renderShowResults = () => {
        if (typeof usersSearch === 'boolean') {
            return `Showing results for: "${query}" (${postsStore.postsPosition.items}
                ${postsStore.postsPosition.items === 1 ? 'result' : 'results'})`
        }

        return `Showing results for: "${query}" (${usersSearch.length} users)`
    }

    return (
        <>
            <Helmet>
                <title>{`Search results: ${query}`}</title>
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
                                <span className={'f6'}>{user.pub}</span>
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
                    tag={query}
                />
            )}
        </>
    )
}

export default observer(SearchPage)
