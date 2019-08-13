import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Thread } from '@components'

interface IEPageProps {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
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
    static async getInitialProps({ ctx: { query, store } }) {
        const postsStore: IStores['postsStore'] = store.postsStore
        postsStore.setActiveThreadId(query.id)
        return {
            query,
        }
    }

    public render(): React.ReactNode {
        const { getThreadById, activeThread } = this.props.postsStore
        return getThreadById['match']({
            pending: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
            rejected: () => <span>No posts found for specified sub: {this.props.query.tag}</span>,
            resolved: (thread) => {
                if (!thread || !activeThread) return null
                return (
                    <div className={'thread-container'}>
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
