import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'
import { MainPost, Replies } from '@components'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface IEPage {
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

@inject('postsStore', 'tagStore')
@observer
class E extends React.Component<IEPage> {
    static async getInitialProps({ router, ctx: { query } }) {
        const isTagView = typeof query.id === 'undefined' && typeof query.title === 'undefined'
        return {
            query,
            subName: router.query.tag,
            isTagView,
        }
    }

    componentWillMount(): void {
        if (this.props.subName) {
            this.props.tagStore.setActiveTag(this.props.subName)
        }

        if (this.props.isTagView) {
            this.props.postsStore.getPostsByTag([this.props.query.tag])
        }

        if (!this.props.isTagView) {
            this.props.postsStore.setActivePostId(this.props.query.id)
            ;(this.props.postsStore.fetchPost as any).reset()
            this.props.postsStore
                .fetchPost()
                .then((thread: any) => {
                    console.log('Thread fetched!:', thread)
                    this.props.tagStore.setActiveTag(thread.openingPost.sub)
                })
                .catch(err => {
                    console.log(err)
                })
        }
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
            submitReply,
        } = this.props.postsStore

        return (fetchPost as any).match({
            pending: () => <FontAwesomeIcon icon={faSpinner} spin />,
            rejected: err => <span>{err.message}</span>,
            resolved: ({ openingPost, map }) => {
                return (
                    <div className={'thread-container'}>
                        <MainPost openingPost={openingPost} />
                        <div className={'mb2'}>
                            <span className={'b f6 pb2'}>
                                viewing all {Object.keys(map).length} comments
                            </span>
                        </div>
                        <div className={'card pr2 pv1'}>
                            {Object.keys(map).map(post => {
                                if (post === openingPost.threadUuid) {
                                    return null
                                }

                                if (map[post]['parentUuid'] !== openingPost.uuid) {
                                    return null
                                }

                                return (
                                    <Replies
                                        post={map[post]}
                                        key={map[post]['uuid']}
                                        replyingPostUUID={replyingPostUUID}
                                        replyPostHandler={setReplyPostContent}
                                        replyOpenHandler={setReplyingPostUUID}
                                        submitReplyHandler={submitReply}
                                    />
                                )
                            })}
                        </div>
                    </div>
                )
            },
        })
    }
}

export default E
