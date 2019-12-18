import * as React from 'react'

import './style.scss'
import { openInNewTab } from '@utils'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faChevronLeft,
    faEye,
    faEyeSlash,
    faLink,
    faPen,
    faReply,
} from '@fortawesome/free-solid-svg-icons'
import {
    Attachments,
    UserNameWithIcon,
    VotingHandles,
    Form,
    SharePost,
    RichTextPreview,
} from '@components'
import moment from 'moment'
import PostModel from '@models/postModel'
import { ThreadModel } from '@models/threadModel'
import { observer } from 'mobx-react'
import { TagModel } from '@models/tagModel'

interface IOpeningPostProps {
    isPreview?: boolean
    canEditPost?: boolean
    isWatchingPost?: (id: string) => boolean
    watchPost?: (id: string, count: number) => void
    openingPost: PostModel
    asPath: string
    activeTag: TagModel
    activeThread: ThreadModel
    id: string
    hasReplyContent: boolean
    showPostWarningCloseModal: () => void
    toggleBlockPost: (threadUuid: string) => void
}

const OpeningPost: React.FC<IOpeningPostProps> = ({
    isPreview,
    canEditPost,
    openingPost,
    activeThread,
    activeTag,
    watchPost,
    isWatchingPost,
    id,
    hasReplyContent,
    showPostWarningCloseModal,
    toggleBlockPost,
}) => {
    return (
        <div data-post-uuid={openingPost.uuid}>
            {typeof isPreview === 'undefined' && (
                <div className={'pb2'}>
                    <Link href={`/tag/[name]`} as={`/tag/${openingPost.sub}`}>
                        <a
                            onClick={e => {
                                // e.preventDefault()
                                //
                                // if (hasReplyContent) {
                                //     showPostWarningCloseModal()
                                // }
                            }}
                        >
                            <button
                                className={'tl flex items-center'}
                                title={`Show all posts in ${openingPost.sub}`}
                            >
                                <FontAwesomeIcon
                                    width={13}
                                    icon={faChevronLeft}
                                    className={'pr1'}
                                />
                                {activeTag && (
                                    <img
                                        width={20}
                                        height={20}
                                        src={activeTag.icon}
                                        className={'activeTag-image'}
                                    />
                                )}
                                {`#${openingPost.sub}`}
                            </button>
                        </a>
                    </Link>
                </div>
            )}
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
                            pub={openingPost.pub}
                            imageData={openingPost.imageData}
                            name={openingPost.posterName}
                            imageSize={20}
                        />
                        <span className={'ph1 b'}>&#183;</span>
                        <span
                            title={moment(
                                openingPost.edit ? openingPost.editedAt : openingPost.createdAt
                            ).format('YYYY-MM-DD HH:mm:ss')}
                        >
                            {openingPost.edit && 'edited '}{' '}
                            {moment(
                                openingPost.edit ? openingPost.editedAt : openingPost.createdAt
                            ).fromNow()}
                        </span>
                    </div>

                    <div className={'flex justify-between items-center pb1'}>
                        {!activeThread ||
                            (!activeThread.editing && (
                                <span className={'black f4 b'}>{openingPost.title}</span>
                            ))}
                        {activeThread && activeThread.openingPost && !activeThread.editing && (
                            <VotingHandles
                                uuid={activeThread.openingPost.uuid}
                                myVote={activeThread.openingPost.myVote}
                                upVotes={activeThread.openingPost.upvotes}
                                downVotes={activeThread.openingPost.downvotes}
                                handler={activeThread.vote}
                            />
                        )}
                    </div>

                    {activeThread && activeThread.editing ? (
                        <Form form={activeThread.editForm} hideSubmitButton />
                    ) : (
                        <RichTextPreview className={'black f6 lh-copy overflow-break-word'}>
                            {openingPost.content}
                        </RichTextPreview>
                    )}

                    {/*{openingPost.attachment && <Attachments attachment={openingPost.attachment} />}*/}

                    {activeThread && activeThread.openingPost && (
                        <div className={'footer flex items-center pt3'}>
                            <div className={'flex flex-row w-100 items-center justify-between'}>
                                <div>
                                    <button
                                        className={'reply mr3 pointer dim'}
                                        onClick={
                                            activeThread.rbModel(activeThread.openingPost)
                                                .toggleOpen
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

                                    {canEditPost && (
                                        <span
                                            className={'mr3 black f6 pointer dim'}
                                            title={'Edit post'}
                                            onClick={() => activeThread.toggleEditing()}
                                        >
                                            <FontAwesomeIcon icon={faPen} color={'#929292'} />
                                        </span>
                                    )}

                                    {typeof watchPost !== 'undefined' && (
                                        <span
                                            className={'mr3 black f6 pointer dim'}
                                            title={
                                                !isWatchingPost(id) ? 'Watch Post' : 'Unwatch Post'
                                            }
                                            onClick={() => watchPost(id, activeThread.totalReplies)}
                                        >
                                            <FontAwesomeIcon
                                                icon={!isWatchingPost(id) ? faEyeSlash : faEye}
                                                color={isWatchingPost(id) ? '#079E99' : '#b0b0b0'}
                                            />
                                        </span>
                                    )}

                                    <a
                                        href={`https://eosq.app/tx/${openingPost.transaction}`}
                                        target={'blank'}
                                        className={'black f6 pointer dim'}
                                        title={'View block'}
                                    >
                                        <FontAwesomeIcon
                                            width={13}
                                            color={'#b0b0b0'}
                                            icon={faLink}
                                        />
                                    </a>
                                </div>

                                <SharePost
                                    toggleBlockPost={toggleBlockPost}
                                    uuid={openingPost.threadUuid}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default observer(OpeningPost)
