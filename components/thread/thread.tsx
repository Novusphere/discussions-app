import * as React from 'react'
import { observer, inject } from 'mobx-react'

import './style.scss'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft,
    faExclamationTriangle,
    faLink,
    faReply,
    faShare,
    faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import { Attachments, Reply, ReplyBox, UserNameWithIcon, Votes } from '@components'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import { ThreadModel } from '@models/threadModel'
import { IStores } from '@stores'
import { NextRouter, withRouter } from 'next/router'
import { getBaseUrl, getPermaLink } from '@utils'
import PostModel from '@models/postModel'

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
            <div
                data-post-uuid={openingPost.uuid}
                data-permalink={getPermaLink(router.asPath, openingPost.uuid)}
            >
                <div className={'pb2'}>
                    <Link href={`/tag/[name]`} as={`/tag/${openingPost.sub}`}>
                        <a>
                            <button className={'tl'} title={`Show all posts in ${openingPost.sub}`}>
                                <FontAwesomeIcon width={13} icon={faArrowLeft} className={'pr1'} />
                                {`#${openingPost.sub}`}
                            </button>
                        </a>
                    </Link>
                </div>
                <div className={'opening-post card'}>
                    <div className={'post-content'}>
                        <div className={'flex items-center pb2'}>
                            <Link href={`/tag/[name]`} as={`/tag/${openingPost.sub}`}>
                                <a>
                                    <span className={'b'}>{openingPost.sub}</span>
                                </a>
                            </Link>
                            <span className={'ph1 b'}>&#183;</span>
                            <UserNameWithIcon
                                imageData={openingPost.imageData}
                                name={openingPost.posterName}
                                imageSize={20}
                            />
                            <span className={'ph1 b'}>&#183;</span>
                            <span title={moment(openingPost.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                                {' '}
                                {moment(openingPost.createdAt).fromNow()}
                            </span>
                        </div>

                        <div className={'flex justify-between items-center pb1'}>
                            <span className={'black f4 b'}>{openingPost.title}</span>
                            <Votes
                                uuid={activeThread.openingPost.uuid}
                                myVote={activeThread.openingPost.myVote}
                                upVotes={activeThread.openingPost.upvotes}
                                downVotes={activeThread.openingPost.downvotes}
                                handler={activeThread.vote}
                            />
                        </div>

                        <ReactMarkdown
                            className={'black f6 lh-copy'}
                            source={openingPost.content}
                        />

                        <Attachments attachment={openingPost.attachment} />

                        <div className={'footer flex items-center pt3'}>
                            {getAndSetThread['pending'] ? (
                                <FontAwesomeIcon width={13} icon={faSpinner} spin />
                            ) : (
                                <button
                                    className={'reply mr3 pointer dim'}
                                    onClick={
                                        activeThread.rbModel(activeThread.openingPost).toggleOpen
                                    }
                                >
                                    <FontAwesomeIcon
                                        fixedWidth
                                        width={13}
                                        icon={faReply}
                                        className={'pr1'}
                                    />
                                    reply
                                </button>
                            )}

                            <FontAwesomeIcon
                                width={13}
                                icon={faLink}
                                className={'pr2 black f6 pointer dim'}
                            />
                            <FontAwesomeIcon
                                width={13}
                                icon={faShare}
                                className={'pr2 black f6 pointer dim'}
                            />

                            <span className={'f6 black f6'}>
                                <FontAwesomeIcon
                                    width={13}
                                    icon={faExclamationTriangle}
                                    className={'pr1 pointer dim'}
                                />
                                mark as spam
                            </span>
                        </div>
                    </div>
                </div>
            </div>
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
                {this.renderOpeningPost()}
                {this.renderOpeningPostReplyBox()}
                {this.renderReplyContent()}
            </>
        )
    }
}

export default Thread as React.ComponentClass<IThreadOuterProps>
