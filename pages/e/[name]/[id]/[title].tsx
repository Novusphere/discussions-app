import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { ShowFullThread } from '@components'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NextRouter } from 'next/router'

interface IEPageProps {
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
    tagStore: IStores['tagStore']
    // thread: any
    query: {
        name: string
        id: string
        title: string
    }

    router: NextRouter
}

interface IEPageState {
    thread: any
}

@inject('postsStore', 'tagStore', 'uiStore')
@observer
class E extends React.Component<IEPageProps, IEPageState> {
    static async getInitialProps({ query }) {
        return {
            query,
        }
    }

    async componentDidMount(): Promise<void> {
        this.props.tagStore.setActiveTag(this.props.query.name)
        this.props.uiStore.toggleBannerStatus(true)
        this.props.uiStore.toggleSidebarStatus(true)
        await this.props.postsStore.getAndSetThread(this.props.query.id)
    }

    public render(): React.ReactNode {
        let {
            postsStore: { activeThread },
        } = this.props

        return this.props.postsStore.getAndSetThread['match']({
            pending: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
            rejected: () => 'Error!',
            resolved: () => <ShowFullThread thread={activeThread} />,
        })
    }
}

export default E
