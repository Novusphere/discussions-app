import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Thread } from '@components'
import { ThreadModel } from '@models/threadModel'
import Head from 'next/head'
import Router from 'next/router'
import url from 'url'
import { decodeId } from '@utils'

interface IEPageProps {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
    thread: ThreadModel
    query: {
        tag: string
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
        const uiStore: IStores['uiStore'] = store.uiStore
        const tagStore: IStores['tagStore'] = store.tagStore
        const postsStore: IStores['postsStore'] = store.postsStore
        tagStore.setActiveTag(query.tag)

        let thread = await postsStore.getAndSetThread(query.id)

        if (thread) {
            query.title = thread.title
            query.tag = thread.sub
        }

        uiStore.toggleSidebarStatus(true)
        uiStore.toggleBannerStatus(true)

        return {
            query,
            thread,
        }
    }

    async componentWillMount(): Promise<void> {
        this.props.tagStore.setActiveTag(this.props.query.tag)
    }

    public render(): React.ReactNode {
        let {
            query: { id, tag, title },
            thread,
        } = this.props

        if (!thread) {
            return <span>No posts found for specified thread: {id}</span>
        }

        thread = new ThreadModel(thread as any)

        return (
            <div className={'thread-container'}>
                <Head>
                    <title>
                        {title} - {tag}
                    </title>
                </Head>
                <Thread
                    opening={thread.openingPost}
                    openingModel={thread.rbModel(thread.openingPost)}
                    getModel={thread.rbModel}
                    getRepliesFromMap={thread.getRepliesFromMap}
                    vote={thread.vote}
                    openingPostReplies={thread.openingPostReplies}
                    totalReplies={thread.totalReplies}
                />
            </div>
        )
    }
}

export default E
