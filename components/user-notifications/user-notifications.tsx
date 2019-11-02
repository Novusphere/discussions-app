import * as React from 'react'
import { observer } from 'mobx-react'
import { IStores } from '@stores'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import { pushToThread } from '@utils'
import { Router } from '@router'

interface IUserNotificationsOuterProps {
    notificationsStore: IStores['notificationsStore']
}

interface IUserNotificationsInnerProps {}

interface IUserNotificationsState {
    height: number
}

@observer
class UserNotifications extends React.Component<
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

    private getPoster = (notification: any) => {
        let poster = notification.poster

        if (poster === 'eosforumanon') {
            poster = notification.displayName
        }

        return poster
    }

    private renderNotification = (notification: any) => {
        return (
            <span
                className={'notification-item'}
                key={notification.uuid}
                title={'Click to go to post'}
                onClick={() => pushToThread(notification)}
            >
                <span className={'f5 tl'}>
                    <span className={'f6 b flex mb2'}>
                        You have been mentioned by {this.getPoster(notification)}
                    </span>
                    <ReactMarkdown
                        className={'black flex notifications-content'}
                        source={notification.content}
                    />
                </span>
                <span
                    className={'f6 tl flex mt3'}
                    title={moment(notification.createdAt).toLocaleString()}
                >
                    {moment(notification.createdAt).fromNow()}
                </span>
            </span>
        )
    }

    private renderNotifications = () => {
        if (!this.props.notificationsStore.firstSetOfNotifications.length) {
            return <span className={'tc f6 pt4 self-center'}>You have no new notifications</span>
        }

        return this.props.notificationsStore.firstSetOfNotifications.map(notification => {
            return this.renderNotification(notification)
        })
    }

    private goToNotifications = () => {
        Router.pushRoute('notifications')
    }

    public render() {
        return (
            <div
                ref={this.container}
                style={{
                    minHeight: this.state.height ? this.state.height : undefined,
                }}
            >
                {this.props.notificationsStore.fetchNotifications['match']({
                    pending: () => <span>Loading...</span>,
                    rejected: () => <span>Failed to fetch your notifications</span>,
                    resolved: () => (
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
                                <span
                                    onClick={this.goToNotifications}
                                    className={'dim pointer'}
                                    title={'View all notifications, including ones that are read'}
                                >
                                    view all
                                </span>
                            </div>
                        </div>
                    ),
                })}
            </div>
        )
    }
}

export default UserNotifications as React.ComponentClass<IUserNotificationsOuterProps>
