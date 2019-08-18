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
        const thread = await postsStore.getThreadById(query.id)

        return {
            query,
            thread,
        }
    }

    public render(): React.ReactNode {
        let {
            thread,
            query: { id, tag },
        } = this.props

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
    }
}

export default E
