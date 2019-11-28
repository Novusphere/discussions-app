import * as React from 'react'
import { observer } from 'mobx-react'
import { IStores } from '@stores'
import Link from 'next/link'
import { NotificationItem } from '@components'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface IUserNotificationsOuterProps {
    notificationsStore: IStores['notificationsStore']
}

interface IUserNotificationsInnerProps {}

interface IUserNotificationsState {
    height: number
}

@observer
class Notifications extends React.Component<
    IUserNotificationsOuterProps & IUserNotificationsInnerProps,
    IUserNotificationsState
> {
    state = {
        height: 0,
    }

    private container = React.createRef<HTMLDivElement>()

    async componentDidMount(): Promise<void> {
        this.props.notificationsStore.setTimeStamp()
        this.props.notificationsStore.resetUnreadCount()
        this.props.notificationsStore.syncCountsForUnread()
    }

    private clearNotifications = () => {
        const { height } = this.container.current.getBoundingClientRect()
        this.setState(
            {
                height,
            },
            () => {
                this.props.notificationsStore.clearNotifications()
            }
        )
    }

    private renderNotifications = () => {
        const {
            notificationTrayItems,
            notificationTrayItemsSorted,
            firstTimePulling,
            fetchNotifications,
            clearNotification,
        } = this.props.notificationsStore

        if (fetchNotifications['pending'] && firstTimePulling) {
            return <FontAwesomeIcon width={13} icon={faSpinner} spin />
        }

        if (!notificationTrayItems.size) {
            return <span className={'tc f6 pt4 self-center'}>You have no new notifications</span>
        }

        return notificationTrayItemsSorted.map(notification => {
            return <NotificationItem notification={notification} key={notification.post.uuid} onClick={clearNotification} />
        })
    }

    public render() {
        return (
            <div
                ref={this.container}
                style={{
                    minHeight: this.state.height ? this.state.height : undefined,
                }}
            >
                <div className={'notification-tooltip'} style={{ width: 300 }}>
                    {this.renderNotifications()}
                    <div
                        className={
                            'f6 gray bg-near-white w-100 self-end pv3 ph3 flex flex-row justify-between'
                        }
                    >
                        <span
                            onClick={this.clearNotifications}
                            className={'b dim pointer'}
                            title={'Mark all new notifications as read'}
                        >
                            mark as read
                        </span>
                        <Link href={'/notifications'}>
                            <a
                                className={'dim pointer'}
                                title={'View all notifications, including ones that are read'}
                            >
                                view all
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
}

export default Notifications as React.ComponentClass<IUserNotificationsOuterProps>
