import * as React from 'react'
import { MainPost, Replies, Reply } from '@components'
import { ThreadModel } from '@models/threadModel'
import { observer } from 'mobx-react'

interface IThreadContainerProps {
    thread: ThreadModel
    vote: (uuid: string, type: string, value: number) => Promise<any>
}

const ThreadContainer: React.FC<IThreadContainerProps> = ({ thread, vote }) => {
    const reply = thread.rbModel(thread)
    return (
        <>
            <MainPost
                openingPost={thread.openingPost}
                replyHandler={thread.toggleReplyBoxStatus}
                voteHandler={vote}
            />
            {reply.open ? (
                <div className={'mb3'}>
                    <Reply
                        uid={thread.uuid}
                        onContentChange={reply.setContent}
                        onSubmit={reply.onSubmit}
                    />
                </div>
            ) : null}
            {thread.totalReplies ? (
                <>
                    <div className={'mb2'}>
                        <span className={'b f6 pb2'}>
                            viewing all {thread.totalReplies} comments
                        </span>
                    </div>

                    <div className={'card pr2 pv1'}>
                        {thread.replies.map(reply => (
                            <Replies
                                post={reply}
                                key={reply.uuid}
                                getModel={thread.rbModel}
                                voteHandler={vote}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </>
    )
}

export default observer(ThreadContainer)
