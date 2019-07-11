import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'
import { MainPost, Replies, Reply } from '@components'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface IEPageProps {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
    isTagView: boolean
    subName: string | undefined
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
    static async getInitialProps({ router, ctx: { query } }) {
        const isTagView = typeof query.id === 'undefined' && typeof query.title === 'undefined'
        return {
            query,
            subName: router.query.tag,
            isTagView,
        }
    }

    // TODO: Move this into getInitialProps
    componentWillMount(): void {
        // if (this.props.subName) {
        //     this.props.tagStore.setActiveTag(this.props.subName)
        // }

        if (this.props.isTagView) {
            this.props.postsStore.getPostsByTag([this.props.query.tag])
        }

        if (!this.props.isTagView) {
            this.props.postsStore.setActiveThreadId(this.props.query.id)
            this.props.postsStore.fetchPost().catch(err => {
                console.error(err)
            })
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error(error, errorInfo)
    }

    public render(): React.ReactNode {
        if (this.props.isTagView) {
            return (
                <span className={'b'}>
                    No posts found for specified tag: {this.props.query.tag}
                </span>
            )
        }

        const {
            fetchPost,
            replyingPostUUID,
            setReplyingPostUUID,
            setReplyPostContent,
            openingPostReplyOpen,
            setOpeningPostContent,
            setOpeningPostToggle,
            submitReply,
            vote,
            threadMap,
            threadOpeningPost,
        } = this.props.postsStore

        if ((fetchPost as any).state === 'pending') return <FontAwesomeIcon icon={faSpinner} spin />
        if ((fetchPost as any).state === 'rejected')
            return <span>{(fetchPost as any).error.message}</span>

        return (
            <div className={'thread-container'}>
                <MainPost
                    openingPost={threadOpeningPost}
                    replyHandler={setOpeningPostToggle}
                    voteHandler={vote}
                />
                {openingPostReplyOpen ? (
                    <div className={'mb3'}>
                        <Reply
                            uid={threadOpeningPost.uuid}
                            onContentChange={setOpeningPostContent}
                            onSubmit={submitReply}
                        />
                    </div>
                ) : null}
                {threadOpeningPost.totalReplies ? (
                    <>
                        <div className={'mb2'}>
                            <span className={'b f6 pb2'}>
                                viewing all {threadOpeningPost.totalReplies} comments
                            </span>
                        </div>

                        <div className={'card pr2 pv1'}>
                            {Object.keys(threadMap).map(post => {
                                if (post === threadOpeningPost.threadUuid) {
                                    return null
                                }

                                if (threadMap[post]['parentUuid'] !== threadOpeningPost.uuid) {
                                    return null
                                }

                                return (
                                    <Replies
                                        post={threadMap[post]}
                                        key={threadMap[post]['uuid']}
                                        replyingPostUUID={replyingPostUUID}
                                        replyPostHandler={setReplyPostContent}
                                        replyOpenHandler={setReplyingPostUUID}
                                        submitReplyHandler={submitReply}
                                        voteHandler={vote}
                                    />
                                )
                            })}
                        </div>
                    </>
                ) : null}
            </div>
        )
    }
}

export default E
