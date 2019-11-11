import * as React from 'react'
import { inject, observer } from 'mobx-react'

import './style.scss'
import { OpeningPost, Reply, ReplyBox } from '@components'
import { ThreadModel } from '@models/threadModel'
import { IStores } from '@stores'
import { NextRouter, withRouter } from 'next/router'
import Head from 'next/head'
import { Thread as NSThread } from '@novuspherejs'

interface IThreadOuterProps {
    thread: NSThread
}

interface IThreadInnerProps {
    postsStore: IStores['postsStore']
    router: NextRouter
}

interface IThreadState {
    threadAsModel: ThreadModel
}

@(withRouter as any)
@inject('postsStore')
@observer
class Thread extends React.Component<IThreadOuterProps & IThreadInnerProps, IThreadState> {
    constructor(props) {
        super(props)

        this.state = {
            threadAsModel: new ThreadModel(props.thread),
        }
    }

    componentWillUnmount(): void {
        this.state.threadAsModel.toggleEditing(false)

        if (this.props.postsStore.currentHighlightedPostUuid) {
            this.props.postsStore.highlightPostUuid('')
        }
    }

    private renderOpeningPost = () => {
        const {
            router,
            thread: { openingPost },
        } = this.props

        const { threadAsModel } = this.state

        return (
            <OpeningPost
                openingPost={openingPost as any}
                asPath={router.asPath}
                activeThread={threadAsModel}
                canEditPost={threadAsModel.canEditPost}
            />
        )
    }

    private renderOpeningPostReplyBox = () => {
        const { openingPost, uuid } = this.props.thread

        const openingReplyModel = this.state.threadAsModel.rbModel(openingPost)

        if (!openingReplyModel.open) return null

        return (
            <div className={'mb3'}>
                <ReplyBox
                    uid={uuid}
                    onContentChange={openingReplyModel.setContent}
                    onSubmit={openingReplyModel.onSubmit}
                    loading={openingReplyModel.onSubmit['pending']}
                />
            </div>
        )
    }

    private renderReplyContent = () => {
        const { thread } = this.props

        const totalReplies = Object.keys(thread.map).length - 1

        if (!totalReplies) return null

        return (
            <>
                <div className={'mb2'}>
                    <span className={'b f6 pb2'}>viewing all {totalReplies} comments</span>
                </div>
                {this.renderReplies()}
            </>
        )
    }

    private renderReplies = () => {
        const { router } = this.props

        const {
            threadAsModel: { openingPostReplies, rbModel, getRepliesFromMap, vote },
        } = this.state

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
                            threadReference={this.state.threadAsModel}
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
                <Head>
                    <title>
                        {this.props.thread.title} | {this.props.thread.openingPost.sub}
                    </title>
                </Head>
                {this.renderOpeningPost()}
                {this.renderOpeningPostReplyBox()}
                {this.renderReplyContent()}
            </>
        )
    }
}

export default Thread as React.ComponentClass<IThreadOuterProps>
