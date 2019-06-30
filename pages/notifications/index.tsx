import * as React from 'react'
import { task } from 'mobx-task'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'
import { discussions } from '@novuspherejs/index'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { reaction } from 'mobx'
import { IPost } from '@stores/posts'
import { Notification } from '@components'

interface INotificationsProps {
    authStore: IStores['authStore']
}

@inject('authStore')
@observer
class Notifications extends React.Component<INotificationsProps> {
    @task.resolved
    private fetchNotifications = async () => {
        if (this.props.authStore.isLoggedIn) {
            return await discussions.getNotifications()
        }

        return <span>No notifications found</span>
    }

    componentDidMount(): void {
        reaction(() => this.props.authStore.isLoggedIn, () => this.fetchNotifications(), {
            fireImmediately: true,
        })
    }

    public clickNotification = (post: IPost) => {
        console.log(post)
    }

    public render(): React.ReactNode {
        return this.fetchNotifications['match']({
            pending: () => <FontAwesomeIcon icon={faSpinner} spin />,
            rejected: () => 'Something went wrong fetching notifications',
            resolved: notifications => {
                if (!notifications || !notifications.posts) {
                    return <span>No notifications</span>
                }

                if (this.fetchNotifications['state'] === 'pending') {
                    return <FontAwesomeIcon icon={faSpinner} spin />
                }

                return notifications.posts.map(notificationPosts => (
                    <Notification notification={notificationPosts} key={notificationPosts.id} onClick={this.clickNotification} />
                ))
            },
        })
    }
}

export default Notifications
