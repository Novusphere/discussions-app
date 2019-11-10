import * as React from 'react'
import { observer, inject } from 'mobx-react'

import './style.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { OpeningPost, Reply, ReplyBox } from '@components'
import { ThreadModel } from '@models/threadModel'
import { IStores } from '@stores'
import { NextRouter, withRouter } from 'next/router'
import PostModel from '@models/postModel'
import Head from 'next/head'

interface IThreadOuterProps {
    thread: ThreadModel
}

interface IThreadInnerProps {
    postsStore: IStores['postsStore']
    router: NextRouter
}

interface IThreadState {}

@(withRouter as any)
@inject('postsStore')
@observer
class Thread extends React.Component<IThreadOuterProps & IThreadInnerProps, IThreadState> {
    componentWillUnmount(): void {
        if (this.props.postsStore.currentHighlightedPostUuid) {
            this.props.postsStore.highlightPostUuid('')
        }
    }

    private renderOpeningPost = () => {
        const {
            router,
            thread: { openingPost },
            postsStore: { activeThread, getAndSetThread },
        } = this.props

        return (
            <OpeningPost
                openingPost={openingPost}
                asPath={router.asPath}
                getThreadLoading={getAndSetThread['pending']}
                activeThread={activeThread}
            />
        )
    }

    private renderOpeningPostReplyBox = () => {
        const {
            thread: { openingPost },
            postsStore: { activeThread, getAndSetThread },
        } = this.props

        if (getAndSetThread['pending']) {
            return <FontAwesomeIcon width={13} icon={faSpinner} spin />
        }

        const openingReplyModel = activeThread.rbModel(activeThread.openingPost)

        if (!openingReplyModel.open) return null

        return (
            <div className={'mb3'}>
                <ReplyBox
                    uid={openingPost.uuid}
                    onContentChange={openingReplyModel.setContent}
                    onSubmit={openingReplyModel.onSubmit}
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
        const {
            router,
            postsStore: {
                getAndSetThread,
                activeThread: { openingPostReplies, getRepliesFromMap, vote, rbModel },
            },
        } = this.props

        if (getAndSetThread['pending']) {
            return <FontAwesomeIcon width={13} icon={faSpinner} spin />
        }

        return (
            <div className={'card'}>
                {openingPostReplies.map(reply => {
                    const post = new PostModel(reply)
                    return (
                        <Reply
                            currentPath={router.asPath}
                            post={post}
                            key={reply.uuid}
                            getModel={rbModel}
                            voteHandler={vote}
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
                    <title>{this.props.thread.title} | {this.props.thread.sub}</title>
                </Head>
                {this.renderOpeningPost()}
                {this.renderOpeningPostReplyBox()}
                {this.renderReplyContent()}
            </>
        )
    }
}

export default Thread as React.ComponentClass<IThreadOuterProps>
