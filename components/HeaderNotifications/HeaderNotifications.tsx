import React, { FunctionComponent, useCallback } from 'react'
import { Icon, Badge, Button, List, Avatar, Dropdown } from 'antd'

import styles from './HeaderNotifications.module.scss'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import { getIdenticon, getThreadUrl, useInterval } from '@utils'
import { RichTextPreview } from '@components'
import moment from 'moment'
import cx from 'classnames'
import { Link, useHistory } from 'react-router-dom'

interface IHeaderNotificationsProps {}

const NotificationContainer = () => {
    const { userStore, authStore }: RootStore = useStores()
    const history = useHistory()

    if (!authStore.hasAccount) {
        return null
    }

    const handleNotificationClick = useCallback(({ index, item }) => {
        getThreadUrl(item, item.title === '' ? item.uuid : null).then(url => {
            history.push(url)
            userStore.deleteNotification(index)
        })
    }, [])

    return (
        <List
            locale={{
                emptyText: (
                    <span className={'db pa4 tc w-100 moon-gray'}>You have no notifications</span>
                ),
            }}
            className={styles.listContainer}
            itemLayout="horizontal"
            dataSource={userStore.notifications}
            renderItem={(item, index) => {
                return (
                    <List.Item className={styles.notificationItem}>
                        <div
                            className={'dim w-100 relative'}
                            onClick={() =>
                                handleNotificationClick({
                                    index,
                                    item,
                                })
                            }
                        >
                            <List.Item.Meta
                                {...(item.pub && {
                                    avatar: <Avatar src={getIdenticon(item.pub)} />,
                                })}
                                {...(item['tag'] && {
                                    avatar: <Avatar src={item['tag']['logo']} />,
                                })}
                                title={
                                    <span
                                        className={
                                            'w-100 flex flex-row items-center justify-between'
                                        }
                                    >
                                        <span className={'gray b f6'}>{item.displayName}</span>
                                        <span className={'light-silver f7'}>
                                            {moment(item.createdAt).fromNow()}
                                        </span>
                                    </span>
                                }
                                description={
                                    <div className={styles.contentContainer}>
                                        <RichTextPreview className={'silver'}>
                                            {item.content}
                                        </RichTextPreview>
                                    </div>
                                }
                            />
                        </div>
                    </List.Item>
                )
            }}
            footer={
                <div
                    className={cx([
                        styles.bottomBar,
                        'flex flex-row items-center justify-between tc',
                    ])}
                >
                    <a className={'dim pointer'} onClick={userStore.clearNotifications}>
                        Clear Notifications
                    </a>
                    <Link to={'/notifications'} className={'dim pointer'}>
                        View All
                    </Link>
                </div>
            }
        />
    )
}

const HeaderNotifications: FunctionComponent<IHeaderNotificationsProps> = () => {
    const { userStore, authStore, walletStore }: RootStore = useStores()

    useInterval(
        () => {
            if (authStore.hasAccount) {
                userStore.pingServerForData()
                walletStore.refreshAllBalances()
            }

            return false
        },
        20000,
        true,
        [authStore.hasAccount]
    )

    return (
        <Dropdown
            overlay={NotificationContainer()}
            overlayClassName={styles.notificationsOverlayContainer}
            placement={'bottomRight'}
            onVisibleChange={visible => {
                if (visible && authStore.hasAccount) {
                    userStore.lastCheckedNotifications = Date.now()
                    userStore.notificationCount = 0
                    userStore.syncDataFromLocalToServer()
                }
            }}
        >
            <Badge count={userStore.notificationCount} overflowCount={5} offset={[-10, 5]}>
                <Button type={'link'}>
                    <Icon
                        type={'bell'}
                        twoToneColor={'#08b2ad'}
                        theme={'twoTone'}
                        style={{ fontSize: 24, color: '#a8a8a8' }}
                    />
                </Button>
            </Badge>
        </Dropdown>
    )
}

HeaderNotifications.defaultProps = {}

export default observer(HeaderNotifications)
