import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { Thread } from '@components'
import { ThreadModel } from '@models/threadModel'
import Head from 'next/head'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface IEPageProps {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
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
        const uiStore: IStores['uiStore'] = store.uiStore
        const tagStore: IStores['tagStore'] = store.tagStore
        const postsStore: IStores['postsStore'] = store.postsStore
        tagStore.setActiveTag(query.name)

        let thread = await postsStore.getAndSetThread(query.id)

        if (thread) {
            query.title = thread.title
            query.name = thread.sub
        }

        uiStore.toggleSidebarStatus(true)
        uiStore.toggleBannerStatus(true)

        return {
            query,
        }
    }

    async componentWillMount(): Promise<void> {
        this.props.tagStore.setActiveTag(this.props.query.name)
        await this.props.postsStore.getAndSetThread(this.props.query.id)
    }

    public render(): React.ReactNode {
        let {
            query: { id, name, title },
        } = this.props

        return this.props.postsStore.getAndSetThread['match']({
            pending: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
            rejected: () => <span>No posts found</span>,
            resolved: (activeThread: ThreadModel) => {
                if (!activeThread) {
                    return (
                        <span>
                            No posts found for specified thread: {id} {name} {title}
                        </span>
                    )
                }

                return (
                    <div className={'thread-container'}>
                        <Head>
                            <title>
                                {title} - {name}
                            </title>
                        </Head>
                        <Thread
                            opening={activeThread.openingPost}
                            openingModel={activeThread.rbModel(activeThread.openingPost)}
                            getModel={activeThread.rbModel}
                            getRepliesFromMap={activeThread.getRepliesFromMap}
                            vote={activeThread.vote}
                            openingPostReplies={activeThread.openingPostReplies}
                            totalReplies={activeThread.totalReplies}
                        />
                    </div>
                )
            },
        })
    }
}

export default E
