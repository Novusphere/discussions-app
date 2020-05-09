import React from 'react'
import { Replies } from '@components'
import { observer } from 'mobx-react-lite'

const PostReplies = ({
    totalReplies,
    replies,
    highlightedPostUUID,
    setHighlightedPosUUID,
    threadUsers,
}) => {
    if (totalReplies > 0) {
        return (
            <div className={'mt3'} id={'comments'}>
                <span className={'silver'}>viewing all {totalReplies} comments</span>
                <div className={'mt2 bg-white pv2 card'}>
                    {replies.map(reply => (
                        <Replies
                            key={reply.uuid}
                            reply={reply}
                            threadUsers={threadUsers}
                            highlightedPostUUID={highlightedPostUUID}
                            setHighlightedPosUUID={setHighlightedPosUUID}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return null
}

export default PostReplies
