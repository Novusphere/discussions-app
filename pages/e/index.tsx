import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { Thread } from '@components'
import { ThreadModel } from '@models/threadModel'
import { autorun, observable } from 'mobx'
import { Thread as ThreadType, Post } from '@novuspherejs'

interface IEPageProps {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
    isTagView: boolean
    tag: string | undefined
    thread: ThreadType
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
    @observable public thread: ThreadModel

    static async getInitialProps({ ctx: { query, store } }) {
        const isTagView = typeof query.id === 'undefined' && typeof query.title === 'undefined'
        const postsStore: IStores['postsStore'] = store.postsStore
        const tag = query.tag

        if (isTagView) {
            await postsStore.getPostsByTag([query.tag])
        }

        let thread

        if (!isTagView) {
            postsStore.setActiveThreadId(query.id)
            thread = await postsStore.fetchPost()
        }

        return {
            query,
            tag,
            isTagView,
            thread,
        }
    }

    componentWillMount(): void {
        /**
         * Due to serialization, we lose the ThreadModel prototype
         * as a result we have to instantiate a new one before component mount.
         */
        autorun(() => {
            if (this.props.postsStore.activeThread) {
                if (this.thread instanceof ThreadModel) {
                    this.thread = this.props.postsStore.activeThread
                } else {
                    this.thread = new ThreadModel(this.props.thread)
                    this.props.postsStore.activeThread = this.thread
                }
            }
        })
    }

    public render(): React.ReactNode {
        if (this.props.isTagView) {
            return <span>No posts found for specified tag: {this.props.query.tag}</span>
        }

        const { fetchPost, vote } = this.props.postsStore

        if ((fetchPost as any).state === 'rejected')
            return <span>{(fetchPost as any).error.message}</span>

        return (
            <div className={'thread-container'}>
                <Thread
                    opening={this.thread.openingPost as Post}
                    openingModel={this.thread.rbModel(this.thread.openingPost)}
                    getModel={this.thread.rbModel}
                    getRepliesFromMap={this.thread.getRepliesFromMap}
                    vote={vote}
                    openingPostReplies={this.thread.openingPostReplies}
                    totalReplies={this.thread.totalReplies}
                />
            </div>
        )
    }
}

export default E
