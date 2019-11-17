import * as React from 'react'

import './style.scss'
import { useState } from 'react'
import { useEffect } from 'react'
import { getThreadUrl } from '@utils'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'
import NotificationModel from '@models/notificationModel'

interface INotificationItemProps {
    notification: NotificationModel
}

const NotificationItem: React.FC<INotificationItemProps> = ({ notification }) => {
    const [url, setUrl] = useState('')

    useEffect(() => {
        async function getUrl() {
            let uuid = undefined

            if (!notification.post.title && notification.post.uuid) {
                uuid = notification.post.uuid
            }

            setUrl(await getThreadUrl(notification.post, uuid))
        }
        getUrl()
    }, [])

    return (
        <Link href={'/tag/[name]/[id]/[title]'} as={url}>
            <a className={'notification-item'} title={'Click to go to post'}>
                <span className={'flex flex-row items-center justify-start f5 tl'}>
                    {notification.image}
                    <span className={'f6 b flex mb2 black'}>{notification.title}</span>
                </span>
                {notification.isMentionType && (
                    <object>
                        <ReactMarkdown
                            className={'black flex notifications-content'}
                            source={notification.post.content}
                        />
                    </object>
                )}
                {!notification.isMentionType && (
                    <span className={'black flex notifications-content'}>{notification.content}</span>
                )}
                <span
                    className={'f7 black tl flex mt3'}
                    title={moment(notification.createdAt).toLocaleString()}
                >
                    {moment(notification.createdAt).fromNow()}
                </span>
            </a>
        </Link>
    )
}

export default NotificationItem
