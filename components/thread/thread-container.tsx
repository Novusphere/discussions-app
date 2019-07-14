import * as React from 'react'
import { MainPost, Replies, Reply } from '@components'
import { observer } from 'mobx-react'
import { Post } from '@novuspherejs'
import { ReplyModel } from '@models/replyModel'

interface IThreadContainerProps {
    opening: Post
    openingPostReplies: Post[]
    openingModel: ReplyModel
    totalReplies: number
    getModel: (post: Post) => ReplyModel
    getRepliesFromMap: (uid: string) => Post[]
    vote: (uuid: string, type: string, value: number) => Promise<any>
}

const ThreadContainer: React.FC<IThreadContainerProps> = ({
    opening,
    openingModel,
    openingPostReplies,
    totalReplies,
    getModel,
    getRepliesFromMap,
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
                    <div className={'mb2a'}>
                        <span className={'b f6 pb2'}>viewing all {totalReplies} comments</span>
                    </div>

                    <div className={'card pr2 pv1'}>
                        {openingPostReplies.map(reply => (
                            <Replies
                                post={reply}
                                key={reply.uuid}
                                getModel={getModel}
                                voteHandler={vote}
                                getRepliesFromMap={getRepliesFromMap}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </>
    )
}

export default observer(ThreadContainer)
