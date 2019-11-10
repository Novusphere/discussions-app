import * as React from 'react'

import './style.scss'
import { getPermaLink } from '@utils'
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
import { Attachments, UserNameWithIcon, Votes } from '@components'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import PostModel from '@models/postModel'
import { ThreadModel } from '@models/threadModel'
import { observer } from 'mobx-react'

interface IOpeningPostProps {
    isPreview?: boolean
    openingPost: PostModel
    asPath: string
    getThreadLoading: boolean
    activeThread: ThreadModel
}

const OpeningPost: React.FC<IOpeningPostProps> = ({
    openingPost,
    isPreview,
    getThreadLoading,
    activeThread,
    asPath,
}) => (
    <div
        data-post-uuid={openingPost.uuid}
        {...(asPath && { 'data-permalink': getPermaLink(asPath, openingPost.uuid) })}
    >
        {typeof isPreview === 'undefined' && (
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
                    {activeThread && (
                        <Votes
                            uuid={activeThread.openingPost.uuid}
                            myVote={activeThread.openingPost.myVote}
                            upVotes={activeThread.openingPost.upvotes}
                            downVotes={activeThread.openingPost.downvotes}
                            handler={activeThread.vote}
                        />
                    )}
                </div>

                <ReactMarkdown className={'black f6 lh-copy overflow-break-word'} source={openingPost.content} />

                {openingPost.attachment && <Attachments attachment={openingPost.attachment} />}

                {activeThread && (
                    <div className={'footer flex items-center pt3'}>
                        {getThreadLoading ? (
                            <FontAwesomeIcon width={13} icon={faSpinner} spin />
                        ) : (
                            <button
                                className={'reply mr3 pointer dim'}
                                onClick={activeThread.rbModel(activeThread.openingPost).toggleOpen}
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
                )}
            </div>
        </div>
    </div>
)

export default observer(OpeningPost)
