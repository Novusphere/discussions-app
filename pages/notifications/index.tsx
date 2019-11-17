import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { InfiniteScrollFeed } from '@components'
import { sleep } from '@utils'

interface INotificationsProps {
    notificationsStore: IStores['notificationsStore']
    tagStore: IStores['tagStore']
}

@inject('notificationsStore', 'tagStore')
@observer
class Notifications extends React.Component<INotificationsProps> {
    static async getInitialProps({ store }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        const tagStore: IStores['tagStore'] = store.tagStore
        uiStore.toggleSidebarStatus(true)
        tagStore.destroyActiveTag()
        return {}
    }

    async componentDidMount(): Promise<void> {
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
            />
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
