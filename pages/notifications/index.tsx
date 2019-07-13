import * as React from 'react'
import { task } from 'mobx-task'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
// import { discussions } from '@novuspherejs/index'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { reaction } from 'mobx'
import { Notification } from '@components'
import { TagModel } from '@models/tagModel'
import { INotificationPost, INotifications } from '@novuspherejs/discussions/notification'

interface INotificationsProps {
    authStore: IStores['authStore']
    tagStore: IStores['tagStore']
}

@inject('authStore', 'tagStore')
@observer
class Notifications extends React.Component<INotificationsProps> {
    @task.resolved
    private fetchNotifications = async () => {
        if (this.props.authStore.isLoggedIn) {
            // return await discussions.getNotifications()
        }

        return <span>No notifications found</span>
    }

    componentWillMount(): void {
        this.props.tagStore.activeTag = new TagModel({
            name: 'notifications',
            url: '/notifications',
            logo: '',
        })
    }

    componentDidMount(): void {
        reaction(() => this.props.authStore.isLoggedIn, () => this.fetchNotifications(), {
            fireImmediately: true,
        })
    }

    public clickNotification = (notificationPost: INotificationPost) => {
        console.log(notificationPost)
    }

    public render(): React.ReactNode {
        return this.fetchNotifications['match']({
            pending: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
            rejected: () => 'Something went wrong fetching notifications',
            resolved: (notifications: INotifications) => {
                if (!notifications || !notifications.posts) {
                    return <span>No notifications</span>
                }

                if (this.fetchNotifications['state'] === 'pending') {
                    return <FontAwesomeIcon width={13} icon={faSpinner} spin />
                }

                return notifications.posts.map(notificationPosts => (
                    <Notification
                        notification={notificationPosts}
                        key={notificationPosts.id}
                        onClick={this.clickNotification}
                        tag={this.props.tagStore.tags.get(notificationPosts.data.json_metadata.sub)}
                    />
                ))
            },
        })
    }
}

export default Notifications
