import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { ShowFullThread } from '@components'

interface IEPageProps {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
    thread: any
    query: {
        name: string
        id: string
        title: string
    }
}

interface IEPageState {
    thread: any
}

@inject('postsStore', 'tagStore')
@observer
class E extends React.Component<IEPageProps, IEPageState> {
    static async getInitialProps({ query, store }) {
        const tagStore: IStores['tagStore'] = store.tagStore
        const postsStore: IStores['postsStore'] = store.postsStore
        const uiStore: IStores['uiStore'] = store.uiStore
        uiStore.toggleBannerStatus(true)
        uiStore.toggleSidebarStatus(true)

        tagStore.setActiveTag(query.name)

        let thread = await postsStore.getAndSetThread(query.id)

        if (thread) {
            query.title = thread.title
            query.name = thread.sub
        }

        return {
            query,
            thread,
        }
    }

    async componentWillMount(): Promise<void> {
        this.props.tagStore.setActiveTag(this.props.query.name)
        await this.props.postsStore.getAndSetThread(this.props.query.id)
    }

    public render(): React.ReactNode {
        let {
            thread,
            query: { id, name, title },
        } = this.props

        return <ShowFullThread thread={thread} />
    }
}

export default E
