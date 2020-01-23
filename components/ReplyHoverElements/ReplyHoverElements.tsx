import * as React from 'react'

import './style.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFlag,
    faLink,
    faPen,
    faReply,
    faShare,
    faUserMinus,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import { openInNewTab } from '@utils'
import { ReplyModel } from '@models/replyModel'
import classNames from 'classnames'
import { Post } from '@novuspherejs'
import PostModel from '@models/postModel'
import { NewReplyModel } from '@models/newReplyModel'
import { useObserver } from 'mobx-react-lite'

interface IReplyHoverElementsProps {
    post: Post | PostModel
    replyModel: ReplyModel | NewReplyModel
    hasAccount: boolean
    activePublicKey: string
    isFollowing: boolean
    getPermaLinkUrl: () => void
    toggleFollowStatus: () => void
    toggleToggleBlock: () => void
    isSticky: boolean
    isMarkedAsSpam: boolean
    onMarkSpamComplete: () => void
}

const ReplyHoverElements: React.FC<IReplyHoverElementsProps> = ({
    post,
    hasAccount,
    activePublicKey,
    isFollowing,
    replyModel,
    getPermaLinkUrl,
    toggleFollowStatus,
    toggleToggleBlock,
    isSticky,
    isMarkedAsSpam,
    onMarkSpamComplete,
}) => {
    return useObserver(() => (
        <div
            className={classNames([
                'hover-elements disable-user-select',
                {
                    'hover-elements-sticky': isSticky,
                },
            ])}
        >
            <span onClick={replyModel.toggleOpen} title={'Reply to post'}>
                <FontAwesomeIcon icon={faReply} />
            </span>
            {activePublicKey === post.pub && (
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
                    onClick={() => toggleFollowStatus()}
                >
                    {isFollowing ? (
                        <FontAwesomeIcon icon={faUserMinus} className={'red'} />
                    ) : (
                        <FontAwesomeIcon icon={faUserPlus} />
                    )}
                </span>
            ) : null}
            <span
                title={!isMarkedAsSpam ? 'Mark as spam' : 'Unmark as spam'}
                onClick={() => {
                    toggleToggleBlock()
                    onMarkSpamComplete()
                }}
            >
                <FontAwesomeIcon
                    icon={faFlag}
                    className={classNames({
                        red: isMarkedAsSpam,
                    })}
                />
            </span>
        </div>
    ))
}

export default ReplyHoverElements
