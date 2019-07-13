import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'
import { MainPost, Replies, Reply } from '@components'
import { ThreadModel } from '@models/threadModel'

interface IEPageProps {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
    isTagView: boolean
    tag: string | undefined
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
    private thread: ThreadModel

    static async getInitialProps({ ctx: { query, store } }) {
        const isTagView = typeof query.id === 'undefined' && typeof query.title === 'undefined'
        const postsStore: IStores['postsStore'] = store.postsStore
        const tag = query.tag

        let thread

        if (isTagView) {
            await postsStore.getPostsByTag([query.tag])
        }

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
        this.thread = new ThreadModel(this.props.thread)
    }

    public render(): React.ReactNode {
        if (this.props.isTagView) {
            return <span>No posts found for specified tag: {this.props.query.tag}</span>
        }

        const { fetchPost, vote } = this.props.postsStore

        if ((fetchPost as any).state === 'rejected')
            return <span>{(fetchPost as any).error.message}</span>

        console.log(this.thread)

        return (
            <div className={'thread-container'}>
                <MainPost
                    openingPost={this.thread.openingPost}
                    replyHandler={this.thread.toggleReplyBoxStatus}
                    voteHandler={vote}
                />
                {this.thread.isReplyBoxOpen(this.thread.uuid) ? (
                    <div className={'mb3'}>
                        <Reply
                            uid={this.thread.uuid}
                            onContentChange={
                                this.thread.getReplyBoxModel(this.thread.uuid).setContent
                            }
                            onSubmit={this.thread.getReplyBoxModel(this.thread.uuid).onSubmit}
                        />
                    </div>
                ) : null}
                {this.thread.totalReplies ? (
                    <>
                        <div className={'mb2'}>
                            <span className={'b f6 pb2'}>
                                viewing all {this.thread.totalReplies} comments
                            </span>
                        </div>

                        <div className={'card pr2 pv1'}>
                            {this.thread.replies.map(reply => (
                                <Replies
                                    post={reply}
                                    key={reply.uuid}
                                    reply={this.thread.getReplyBoxModel(reply.uuid)}
                                    voteHandler={vote}
                                />
                            ))}
                        </div>
                    </>
                ) : null}
            </div>
        )
    }
}

export default E
