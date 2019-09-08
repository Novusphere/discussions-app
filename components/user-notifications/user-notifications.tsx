import * as React from 'react'

interface IUserNotificationsProps {}

interface IUserNotificationsState {}

class UserNotifications extends React.Component<IUserNotificationsProps, IUserNotificationsState> {
    public render() {
        return (
            <div className={'notification-tooltip'} style={{ width: 300 }}>
                <span className={'notification-item'}>
                    <span className={'f5 tl'}>
                        <span className={'b black'}>sahkho</span> commented on{' '}
                        <span className={'b'}>your post</span>
                    </span>
                    <span className={'f6 tl'}>8m ago</span>
                </span>
                <span className={'notification-item'}>
                    <span className={'f5 tl'}>
                        <span className={'b black'}>sahkho</span> commented on{' '}
                        <span className={'b'}>your post</span>
                    </span>
                    <span className={'f6 tl'}>8m ago</span>
                </span>
                <span className={'notification-item'}>
                    <span className={'f5 tl'}>
                        <span className={'b black'}>sahkho</span> commented on{' '}
                        <span className={'b'}>your post</span>
                    </span>
                    <span className={'f6 tl'}>8m ago</span>
                </span>
            </div>
        )
    }
}

export default UserNotifications
