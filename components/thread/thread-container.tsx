import * as React from 'react'
import { MainPost, Replies, Reply } from '@components'
import { observer } from 'mobx-react'
import { Post } from '@novuspherejs'
import { ReplyModel } from '@models/replyModel'
import PostModel from '@models/postModel'

interface IThreadContainerProps {
    opening: PostModel
    openingPostReplies: Post[]
    openingModel: ReplyModel
    totalReplies: number
    getModel: (post: PostModel) => ReplyModel
    getRepliesFromMap: (uid: string) => PostModel[]
    vote: (uuid: string, value: number) => void
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
                    <div className={'mb2'}>
                        <span className={'b f6 pb2'}>viewing all {totalReplies} comments</span>
                    </div>

                    <div className={'card'}>
                        {openingPostReplies.map(reply => (
                            <Replies
                                post={reply as any}
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
