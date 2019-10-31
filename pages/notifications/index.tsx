import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface INotificationsProps {
    notificationsStore: IStores['notificationsStore']
}

// TODO: Real-data

@inject('notificationsStore')
@observer
class Notifications extends React.Component<INotificationsProps> {
    static async getInitialProps({ store }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        const tagStore: IStores['tagStore'] = store.tagStore
        uiStore.toggleSidebarAndBanner()
        tagStore.destroyActiveTag()
        return {}
    }

    private renderNotifications = () => {
        return <span>All notifications!</span>
    }

    public render(): React.ReactNode {
        return this.props.notificationsStore.fetchNotifications['match']({
            pending: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
            rejected: () => 'Something went wrong fetching notifications',
            resolved: () => {
                const notifications = Array.from(
                    this.props.notificationsStore.notifications.values()
                )

                if (!notifications.length) {
                    return <span className={'f6'}>No notifications</span>
                }

                return this.renderNotifications()
            },
        })
    }
}

export default Notifications
