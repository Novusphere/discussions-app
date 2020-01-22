import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { ShowFullThread } from '@components'
import Router, { NextRouter, withRouter } from 'next/router'
import { Thread } from '@novuspherejs'
import { NextSeo } from 'next-seo'
import { getThreadUrl, removeMD } from '@utils'
import Head from 'next/head'
import _ from 'lodash'
import { NewThread } from '../../../../components/Thread/NewThread'

interface IEPageProps {
    router: NextRouter
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
    tagStore: IStores['tagStore']
    authStore: IStores['authStore']
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
@inject('postsStore', 'tagStore', 'uiStore', 'authStore')
@observer
class E extends React.Component<IEPageProps, IEPageState> {
    private rn: any = null

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
            authStore: { supportedTokensImages },
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
                <NewThread thread={thread} supportedTokensImages={supportedTokensImages} />
                {/*<ShowFullThread thread={thread} />*/}
            </>
        )
    }
}

export default E
