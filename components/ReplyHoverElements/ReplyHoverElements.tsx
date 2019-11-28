import * as React from 'react'

import './style.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faLink,
    faPen,
    faReply,
    faShare,
    faUserMinus,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import { openInNewTab } from '@utils'
import PostModel from '@models/postModel'
import { ReplyModel } from '@models/replyModel'
import { observer } from 'mobx-react'

interface IReplyHoverElementsProps {
    post: PostModel
    replyModel: ReplyModel
    hasAccount: boolean
    activePublicKey: string
    isFollowing: boolean
    getPermaLinkUrl: () => void
    toggleFollowStatus: () => void
}

const ReplyHoverElements: React.FC<IReplyHoverElementsProps> = ({
    post,
    hasAccount,
    activePublicKey,
    isFollowing,
    replyModel,
    getPermaLinkUrl,
    toggleFollowStatus,
}) => {
    return (
        <div className={'hover-elements disable-user-select'}>
            <span onClick={replyModel.toggleOpen} title={'Reply to post'}>
                <FontAwesomeIcon icon={faReply} />
            </span>
            {replyModel.canEditPost && (
                <span title={'Edit post'} onClick={() => replyModel.toggleEditing()}>
                    <FontAwesomeIcon icon={faPen} />
                </span>
            )}
            <span title={'Permalink'} onClick={getPermaLinkUrl}>
                <FontAwesomeIcon icon={faShare} />
            </span>
            <span
                title={'View block'}
                onClick={() => openInNewTab(`https://eosq.app/tx/${post.transaction}`)}
            >
                <FontAwesomeIcon icon={faLink} />
            </span>
            {post.pub && hasAccount && activePublicKey !== post.pub ? (
                <span
                    title={isFollowing ? 'Unfollow user' : 'Follow user'}
                    onClick={toggleFollowStatus}
                >
                    {isFollowing ? (
                        <FontAwesomeIcon icon={faUserMinus} className={'red'} />
                    ) : (
                        <FontAwesomeIcon icon={faUserPlus} />
                    )}
                </span>
            ) : null}
        </div>
    )
}

export default (ReplyHoverElements)
