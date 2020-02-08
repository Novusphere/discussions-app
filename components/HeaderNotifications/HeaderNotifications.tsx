import React, { FunctionComponent } from 'react'
import { Icon, Badge, Button, Popover, List, Avatar } from 'antd'

import styles from './HeaderNotifications.module.scss'
import { useObserver } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import { getIdenticon, useInterval } from '@utils'
import { RichTextPreview } from '@components'
import Link from 'next/link'
import moment from 'moment'

interface IHeaderNotificationsProps {}

const NotificationContainer = () => {
    const { userStore, authStore }: RootStore = useStores()

    if (!authStore.hasAccount) {
        return null
    }

    return (
        <div className={'pa2'}>
            <div>
                {!userStore.notifications.length && (
                    <span className={'silver'}>You have no notifications</span>
                )}
                {userStore.notifications.length > 0 && (
                    <List
                        itemLayout="horizontal"
                        dataSource={userStore.notifications}
                        renderItem={item => {
                            return (
                                <Link href={'/tag/[name]/[id]/[title]'} as={item['url']} shallow={false}>
                                    <a className={'dim'}>
                                        <List.Item className={styles.notificationItem}>
                                            <List.Item.Meta
                                                avatar={<Avatar src={getIdenticon(item.pub)} />}
                                                title={
                                                    <span
                                                        className={
                                                            'dim flex flex-row items-center justify-between'
                                                        }
                                                    >
                                                    <span className={'gray b f6'}>
                                                        {item.displayName}
                                                    </span>
                                                    <span className={'light-silver'}>
                                                        {moment(item.createdAt).fromNow()}
                                                    </span>
                                                </span>
                                                }
                                            />
                                            <RichTextPreview className={'dim mt3 silver'}>
                                                {item.content}
                                            </RichTextPreview>
                                        </List.Item>
                                    </a>
                                </Link>
                            )
                        }}
                    />
                )}
            </div>
        </div>
    )
}

const HeaderNotifications: FunctionComponent<IHeaderNotificationsProps> = () => {
    const { userStore, authStore }: RootStore = useStores()

    useInterval(
        () => {
            userStore.fetchNotifications(authStore.postPub)
        },
        20000,
        true
    )

    return useObserver(() => (
        <Popover
            content={<NotificationContainer />}
            overlayClassName={styles.notificationsOverlayContainer}
        >
            <Badge count={userStore.notifications.length} overflowCount={5} offset={[-10, 5]}>
                <Button type={'link'}>
                    <Icon
                        type={'bell'}
                        twoToneColor={'#08b2ad'}
                        theme={'twoTone'}
                        style={{ fontSize: 24, color: '#a8a8a8' }}
                    />
                </Button>
            </Badge>
        </Popover>
    ))
}

HeaderNotifications.defaultProps = {}

export default HeaderNotifications
