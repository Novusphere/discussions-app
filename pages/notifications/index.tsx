import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PostPreview } from '@components'
import FeedModel from '@models/feedModel'
import { pushToThread } from '@utils'

interface INotificationsProps {
    notificationsStore: IStores['notificationsStore']
    tagStore: IStores['tagStore']
}

// TODO: Real-data

@inject('notificationsStore', 'tagStore')
@observer
class Notifications extends React.Component<INotificationsProps> {
    static async getInitialProps({ store }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        const tagStore: IStores['tagStore'] = store.tagStore
        uiStore.toggleSidebarStatus(true)
        // uiStore.hideBanner()
        tagStore.destroyActiveTag()
        return {}
    }

    componentDidMount(): void {
        this.props.notificationsStore.fetchNotificationsAsFeed()
    }

    private renderNotifications = () => {
        return this.props.notificationsStore.fetchNotificationsAsFeed['match']({
            pending: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
            rejected: () => 'Something went wrong fetching notifications',
            resolved: (notifications: FeedModel[]) => {
                return notifications.map(notification => {
                    return (
                        <PostPreview
                            disableVoteHandler
                            key={notification.uuid}
                            post={notification}
                            onClick={() => pushToThread(notification)}
                            tag={this.props.tagStore.tags.get(notification.sub)}
                        />
                    )
                })
            },
        })
    }

    public render(): React.ReactNode {
        return (
            <>
                <div className={'card pa4 mb3'}>
                    <span className={'black f5'}>
                        Viewing all your notifications
                    </span>
                </div>

                {this.renderNotifications()}
            </>
        )
    }
}

export default Notifications
