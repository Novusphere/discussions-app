import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Thread } from '@components'
import { ThreadModel } from '@models/threadModel'

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

interface IEPageState {}

@inject('postsStore', 'tagStore')
@observer
class E extends React.Component<IEPageProps, IEPageState> {
    static async getInitialProps({ query, store }) {
        const postsStore: IStores['postsStore'] = store.postsStore
        const tagStore: IStores['tagStore'] = store.tagStore
        const thread = await postsStore.getAndSetThread(query.id)
        tagStore.setActiveTag(query.tag)

        return {
            query,
            thread,
        }
    }

    async componentWillMount(): Promise<void> {
        this.props.tagStore.setActiveTag(this.props.query.tag)
        // await this.props.postsStore.getAndSetThread(this.props.query.id)
    }

    public render(): React.ReactNode {
        let {
            thread,
            query: { id, tag },
        } = this.props

        if (!thread) {
            return <span>No posts found for specified thread: {id}</span>
        }

        return this.props.postsStore.getAndSetThread['match']({
            pending: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
            rejected: () => <span>No posts found for specified thread: {id}</span>,
            resolved: thread => {
                if (!thread) {
                    return <span>No posts found for specified thread: {id}</span>
                }

                return (
                    <div className={'thread-container'}>
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
            },
        })
    }
}

export default E
