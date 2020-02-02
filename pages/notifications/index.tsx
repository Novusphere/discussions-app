import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { InfiniteScrollFeed, RichTextPreview } from '@components'
import { sleep } from '@utils'
import moment from 'moment'
import Link from 'next/link'

interface INotificationsProps {
    notificationsStore: IStores['notificationsStore']
    uiStore: IStores['uiStore']
    tagStore: IStores['tagStore']
}

@inject('notificationsStore', 'tagStore', 'uiStore')
@observer
class Notifications extends React.Component<INotificationsProps> {
    async componentDidMount(): Promise<void> {
        this.props.uiStore.toggleSidebarStatus(true)
        this.props.tagStore.destroyActiveTag()

        const {
            setTimeStamp,
            resetUnreadCount,
            fetchNotificationsAsFeed,
        } = this.props.notificationsStore

        await sleep(500)

        resetUnreadCount()
        setTimeStamp()

        await fetchNotificationsAsFeed()
    }

    private renderNotifications = () => {
        const {
            fetchNotificationsAsFeed,
            postsPosition,
            notifications,
        } = this.props.notificationsStore

        return (
            <InfiniteScrollFeed
                dataLength={notifications.length}
                hasMore={postsPosition.cursorId !== 0}
                next={fetchNotificationsAsFeed}
                posts={notifications}
                withAnchorUid
            >
                {notifications.map(notification => (
                    <Link href={notification.url} key={notification.post.uuid}>
                        <a className={'db card pa4'} title={'Click to go to post'}>
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
                ))}
            </InfiniteScrollFeed>
        )
    }

    public render(): React.ReactNode {
        return (
            <>
                <div className={'card pa4 mb3'}>
                    <span className={'black f5'}>Viewing all your notifications</span>
                </div>

                {this.renderNotifications()}
            </>
        )
    }
}

export default Notifications
