import React, { useCallback, useEffect, useState } from 'react'
import Helmet from 'react-helmet'
import { CommonFeed } from '@components'
import { RootStore, useStores } from '@stores'
import { observer } from 'mobx-react-lite'
import { Icon } from 'antd'
import { Redirect } from 'react-router'

const NotificationsPage = () => {
    const { userStore, authStore }: RootStore = useStores()
    const [loading, setLoading] = useState(false)
    const [notifications, setNotifications] = useState([])
    const fetch = useCallback(
        ({ postPub }) =>
            userStore.fetchNotificationsAsync({
                publicKey: postPub,
                lastCheckedNotifications: 0,
                watchedIds: userStore.watchedThreadIds,
                viewAll: true,
            }),
        []
    )

    useEffect(() => {
        setLoading(true)
        fetch({ postPub: authStore.postPub })
            .then((_notifications: any) => {
                setLoading(false)
                setNotifications(_notifications)
            })
            .catch(() => {
                setLoading(false)
            })
    }, [])

    if (!authStore.hasAccount) {
        return <Redirect to={'/'} />
    }

    return (
        <>
            <Helmet>
                <title>{`Notifications`}</title>
            </Helmet>
            <span className={'db mb3 f6'}>Viewing all notifications</span>
            {loading && <Icon type="loading" />}
            {!loading && (
                <CommonFeed
                    hideSort
                    onFetch={() => null}
                    emptyDescription={'You have no notifications'}
                    posts={notifications}
                    dataLength={notifications.length}
                    cursorId={0}
                />
            )}
        </>
    )
}



export default observer(NotificationsPage)
