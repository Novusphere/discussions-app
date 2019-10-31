import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'

interface IUserNotificationsOuterProps {}

interface IUserNotificationsInnerProps {
    notificationsStore: IStores['notificationsStore']
}

interface IUserNotificationsState {}

@inject('notificationsStore')
@observer
class UserNotifications extends React.Component<
    IUserNotificationsOuterProps & IUserNotificationsInnerProps,
    IUserNotificationsState
> {
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

export default UserNotifications as React.ComponentClass<IUserNotificationsOuterProps>
