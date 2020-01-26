import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import Router, { NextRouter, withRouter } from 'next/router'
import { Thread } from '@novuspherejs'
import { NextSeo } from 'next-seo'
import { getThreadUrl, isServer, removeMD, sleep } from '@utils'
import Head from 'next/head'
import _ from 'lodash'
import { NewThread } from '../../../../components/Thread/NewThread'

interface IEPageProps {
    router: NextRouter
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
}

interface IEPageState {
    thread: any
}

@(withRouter as any)
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
        this.props.tagStore.setActiveSlug(this.props.query.name)
        this.props.uiStore.toggleBannerStatus(true)
        this.props.uiStore.toggleSidebarStatus(true)
    }

    private highglightActiveUuid = () => {
        const [, hash] = this.props.router.asPath.split('#')
        if (hash) {
            this.props.postsStore.highlightPostUuid(hash)
        }
        return hash
    }

    async componentDidMount(): Promise<void> {
        const hash = this.highglightActiveUuid()
        const { thread } = this.props

        if (thread) {
            let url = await getThreadUrl(thread.openingPost)

            if (hash) {
                url += `#${hash}`
            }

            await Router.replace('/tag/[name]/[id]/[title]', url, { shallow: true })
        }
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
                        description: _.truncate(removeMD(thread.openingPost.content), {
                            length: 200,
                        }),
                        site_name: 'Discussions App',
                        images: [
                            {
                                url: activeTag
                                    ? activeTag.icon
                                    : 'https://cdn.novusphere.io/static/atmos2.png',
                                width: 250,
                                height: 250,
                                alt: activeTag ? activeTag.name : 'Discussions App',
                            },
                        ],
                    }}
                />
                <NewThread threadSerialized={thread} id={query.id} />
                {/*<ShowFullThread thread={thread} />*/}
            </>
        )
    }
}

export default E
