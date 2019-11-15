import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { ShowFullThread } from '@components'
import { NextRouter } from 'next/router'
import { Thread } from '@novuspherejs'
import { NextSeo } from 'next-seo'
import { getThreadUrl, removeMD } from '@utils'
import Head from 'next/head'

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
        const {
            thread,
            query,
            tagStore: { activeTag },
        } = this.props

        if (!thread) {
            return <span>Couldn't find this thread: {query.id}</span>
        }

        const poster = thread.openingPost.displayName || thread.openingPost.poster

        return (
            <>
                <Head>
                    <title>
                        {thread.openingPost.title} | {thread.openingPost.sub}
                    </title>
                </Head>
                <NextSeo
                    title={thread.openingPost.title}
                    description={removeMD(thread.openingPost.content)}
                    openGraph={{
                        title: thread.openingPost.title,
                        description: removeMD(thread.openingPost.content),
                        site_name: 'Discussions App',
                        images: [
                            {
                                url: activeTag
                                    ? activeTag.icon
                                    : 'https://cdn.novusphere.io/static/atmos.svg',
                                width: 800,
                                height: 600,
                                alt: activeTag ? activeTag.name : 'Discussions App',
                            },
                        ],
                    }}
                />
                <ShowFullThread thread={thread} />
            </>
        )
    }
}

export default E
