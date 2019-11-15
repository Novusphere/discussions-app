import * as React from 'react'
import { inject, observer } from 'mobx-react'

import './style.scss'
import { OpeningPost, Reply, ReplyBox } from '@components'
import { ThreadModel } from '@models/threadModel'
import { IStores } from '@stores'
import { NextRouter, withRouter } from 'next/router'
import { Thread as NSThread } from '@novuspherejs'
import { observable } from 'mobx'
import { ReplyModel } from '@models/replyModel'

interface IThreadOuterProps {
    thread: NSThread
}

interface IThreadInnerProps {
    postsStore: IStores['postsStore']
    tagStore: IStores['tagStore']
    router: NextRouter
}

interface IThreadState {}

@(withRouter as any)
@inject('postsStore', 'tagStore')
@observer
class Thread extends React.Component<IThreadOuterProps & IThreadInnerProps, IThreadState> {
    @observable threadAsModel: ThreadModel = null
    @observable openingReplyModel: ReplyModel = null

    constructor(props) {
        super(props)
        this.threadAsModel = new ThreadModel(props.thread)
        this.openingReplyModel = this.threadAsModel.rbModel(props.thread.openingPost)
    }

    componentWillUnmount(): void {
        this.threadAsModel.toggleEditing(false)

        if (this.props.postsStore.currentHighlightedPostUuid) {
            this.props.postsStore.highlightPostUuid('')
        }
    }

    // async componentDidMount(): Promise<void> {
    //     const [, uuid] = this.props.router.asPath.split('#')
    //     console.log('Class: Reply, Function: addAndScrollToUuid, Line 82 uuid: ', uuid)
    //     const { offsetTop } = document.getElementById(uuid)
    //     console.log(
    //         'Class: Reply, Function: addAndScrollToUuid, Line 84 document.getElementById(uuid): ',
    //         document.getElementById(uuid)
    //     )
    //
    //     if (offsetTop) {
    //         this.props.postsStore.highlightPostUuid(uuid)
    //         window.scrollTo(0, offsetTop)
    //     }
    // }

    private renderOpeningPost = () => {
        const {
            router,
            thread: { openingPost },
            tagStore: { activeTag }
        } = this.props

        const { threadAsModel } = this

        return (
            <OpeningPost
                openingPost={openingPost as any}
                asPath={router.asPath}
                activeThread={threadAsModel}
                activeTag={activeTag}
                canEditPost={threadAsModel.canEditPost}
            />
        )
    }

    private renderOpeningPostReplyBox = () => {
        if (!this.openingReplyModel.open) return null

        return (
            <div className={'mb3'}>
                <ReplyBox
                    uid={this.props.thread.uuid}
                    onContentChange={this.openingReplyModel.setContent}
                    onSubmit={() => this.openingReplyModel.onSubmit(this.threadAsModel)}
                    loading={this.openingReplyModel.onSubmit['pending']}
                    value={this.openingReplyModel.content}
                />
            </div>
        )
    }

    private renderReplyContent = () => {
        const { thread } = this.props

        const totalReplies = Object.keys(thread.map).length - 1

        return (
            <>
                {totalReplies > 1 && (
                    <div className={'mb2'} id={'comments'}>
                        <span className={'b f6 pb2'}>viewing all {totalReplies} comments</span>
                    </div>
                )}
                {this.renderReplies()}
            </>
        )
    }

    private renderReplies = () => {
        const { router } = this.props

        const {
            threadAsModel: { openingPostReplies, rbModel, getRepliesFromMap, vote },
        } = this

        return (
            <div className={'card'}>
                {openingPostReplies.map(reply => {
                    return (
                        <Reply
                            currentPath={router.asPath}
                            post={reply}
                            key={reply.uuid}
                            getModel={rbModel}
                            voteHandler={vote}
                            threadReference={this.threadAsModel}
                            getRepliesFromMap={getRepliesFromMap}
                        />
                    )
                })}
            </div>
        )
    }

    public render() {
        return (
            <>
                {this.renderOpeningPost()}
                {this.renderOpeningPostReplyBox()}
                {this.renderReplyContent()}
            </>
        )
    }
}

export default Thread as React.ComponentClass<IThreadOuterProps>
