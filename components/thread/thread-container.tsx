import * as React from 'react'
import { MainPost, Replies, Reply } from '@components'
import { observer } from 'mobx-react'
import { Post } from '@novuspherejs'
import { ReplyModel } from '@models/replyModel'

interface IThreadContainerProps {
    opening: Post
    replies: Post[]
    openingModel: ReplyModel
    totalReplies: number
    getModel: (post: Post) => ReplyModel
    vote: (uuid: string, type: string, value: number) => Promise<any>
}

const ThreadContainer: React.FC<IThreadContainerProps> = ({
    opening,
    openingModel,
    replies,
    totalReplies,
    getModel,
    vote,
}) => {
    return (
        <>
            <MainPost
                openingPost={opening}
                replyHandler={openingModel.toggleOpen}
                voteHandler={vote}
            />
            {openingModel.open ? (
                <div className={'mb3'}>
                    <Reply
                        uid={opening.uuid}
                        onContentChange={openingModel.setContent}
                        onSubmit={openingModel.onSubmit}
                    />
                </div>
            ) : null}
            {totalReplies ? (
                <>
                    <div className={'mb2'}>
                        <span className={'b f6 pb2'}>viewing all {totalReplies} comments</span>
                    </div>

                    <div className={'card pr2 pv1'}>
                        {replies.map(reply => (
                            <Replies
                                post={reply}
                                key={reply.uuid}
                                getModel={getModel}
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
