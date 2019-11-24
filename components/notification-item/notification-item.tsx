import * as React from 'react'

import './style.scss'
import Link from 'next/link'
import moment from 'moment'
import NotificationModel from '@models/notificationModel'
import { RichTextPreview } from '@components'

interface INotificationItemProps {
    notification: NotificationModel
    onClick: (id: string) => void
}

const NotificationItem: React.FC<INotificationItemProps> = ({ notification, onClick }) => (
    <span title={'Click to go to post'} onClick={() => onClick(notification.post.uuid)}>
        <Link href={'/tag/[name]/[id]/[title]'} as={notification.url}>
            <a className={'notification-item'}>
                <span className={'flex flex-row items-center justify-start f5 tl'}>
                    {notification.image}
                    <span className={'f6 b flex mb2 black'}>{notification.title}</span>
                </span>
                {notification.isMentionType && (
                    <object>
                        <RichTextPreview className={'black flex notifications-content'}>
                            {notification.post.content}
                        </RichTextPreview>
                    </object>
                )}
                {!notification.isMentionType && (
                    <span className={'black flex notifications-content'}>
                        {notification.content}
                    </span>
                )}
                <span
                    className={'f7 black tl flex mt3'}
                    title={moment(notification.modelCreatedAt).toLocaleString()}
                >
                    {moment(notification.modelCreatedAt).fromNow()}
                </span>
            </a>
        </Link>
    </span>
)

export default NotificationItem
