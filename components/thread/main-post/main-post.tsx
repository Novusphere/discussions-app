import * as React from 'react'
import { observer } from 'mobx-react'
import { Attachments, Votes } from '@components'
import { Link } from '@router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faReply,
    faUserCircle,
    faLink,
    faShare,
    faExclamationTriangle,
    faArrowLeft,
} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import { Post } from '@novuspherejs/discussions/post'

interface IMainPost {
    openingPost: Post
    replyHandler: () => void
    voteHandler: (uuid: string, value: number) => Promise<void>
}

const MainPost: React.FC<IMainPost> = ({ openingPost, replyHandler, voteHandler }) => {
    return (
        <>
            <div className={'pb2'}>
                <Link route={`/e/${openingPost.sub}`}>
                    <a className="f6 link dim br2 ph3 pv2 dib white bg-green mr2">
                        <FontAwesomeIcon width={13} icon={faArrowLeft} className={'pr1'} />
                        {`e/${openingPost.sub}`}
                    </a>
                </Link>
            </div>
            <div className={'opening-post card'}>
                <div className={'post-content'}>
                    <div className={'meta pb2'}>
                        <Link route={`/e/${openingPost.sub}`}>
                            <a>
                                <span className={'b'}>{openingPost.sub}</span>
                            </a>
                        </Link>
                        <span className={'ph1 b'}>&#183;</span>
                        <Link route={`/u/${openingPost.poster}`}>
                            <a>
                                <FontAwesomeIcon width={13} icon={faUserCircle} className={'pr1'} />
                                <span>{openingPost.poster}</span>
                            </a>
                        </Link>
                        <span className={'ph1 b'}>&#183;</span>
                        <span> {moment(openingPost.createdAt).fromNow()}</span>
                    </div>

                    <div className={'flex justify-between items-center pb1'}>
                        <span className={'black f4 b'}>{openingPost.title}</span>
                        <Votes
                            uuid={openingPost.uuid}
                            myVote={openingPost.myVote}
                            upVotes={openingPost.upvotes}
                            downVotes={openingPost.downvotes}
                            handler={voteHandler}
                        />
                    </div>

                    <ReactMarkdown className={'black f6 lh-copy'} source={openingPost.content} />

                    <Attachments attachment={openingPost.attachment} />

                    <div className={'footer flex items-center pt3'}>
                        <button
                            className={'reply mr3 pointer dim'}
                            onClick={replyHandler}
                        >
                            <FontAwesomeIcon
                                fixedWidth
                                width={13}
                                icon={faReply}
                                className={'pr1'}
                            />
                            reply
                        </button>

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
        </>
    )
}

export default observer(MainPost)
