import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { ShowFullThread } from '@components'
import { NextRouter } from 'next/router'
import { Thread } from '@novuspherejs'

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

    thread: Thread
    router: NextRouter
}

interface IEPageState {
    thread: any
}

@inject('postsStore', 'tagStore', 'uiStore')
@observer
class E extends React.Component<IEPageProps, IEPageState> {
    static async getInitialProps({ query, store }) {
        const postsStore: IStores['postsStore'] = store.postsStore

        const thread = await postsStore.getAndSetThread(query.id)

        return {
            query,
            thread,
        }
    }

    componentWillMount(): void {
        this.props.tagStore.setActiveTag(this.props.query.name)
        this.props.uiStore.toggleBannerStatus(true)
        this.props.uiStore.toggleSidebarStatus(true)
    }

    async componentDidMount(): Promise<void> {
        // const { title, id, name } = this.props.query
        //
        // this.props.tagStore.setActiveTag(name)
        // this.props.uiStore.toggleBannerStatus(true)
        // this.props.uiStore.toggleSidebarStatus(true)
        //
        // const thread = await this.props.postsStore.getAndSetThread(id)
        //
        // if (title !== getThreadTitle(thread.title)) {
        //     const url = await getThreadUrl(thread.openingPost)
        //     await Router.push('/tag/[name]/[id]/[title]', url, {
        //         shallow: true,
        //     })
        // }
    }

    public render(): React.ReactNode {
        const { thread } = this.props
        return <ShowFullThread thread={thread} />

        // return this.props.postsStore.getAndSetThread['match']({
        //     pending: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
        //     rejected: () => 'Error!',
        //     resolved: () => <ShowFullThread thread={activeThread} />,
        // })
    }
}

export default E
