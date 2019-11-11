import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { ShowFullThread } from '@components'
import { NextRouter } from 'next/router'
import { Thread } from '@novuspherejs'
import { NextSeo } from 'next-seo'

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

    thread: null | Thread
    router: NextRouter
}

interface IEPageState {
    thread: any
}

@inject('postsStore', 'tagStore', 'uiStore')
@observer
class E extends React.Component<IEPageProps, IEPageState> {
    static async getInitialProps({ query, store, req }) {
        const postsStore: IStores['postsStore'] = store.postsStore

        const thread = await postsStore.getAndSetThread(query.id, !!req)

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

    public render(): React.ReactNode {
        const { thread } = this.props
        const poster = thread.openingPost.displayName || thread.openingPost.poster

        return (
            <>
                <NextSeo
                    title={thread.openingPost.title}
                    description={`Posted in #${thread.openingPost.sub} by ${poster}`}
                    openGraph={{
                        url: window.location.origin,
                        title: thread.openingPost.title,
                        description: `Posted in #${thread.openingPost.sub} by ${poster}`,
                        site_name: 'Discussions App',
                    }}
                />
                <ShowFullThread thread={thread} />
            </>
        )
    }
}

export default E
