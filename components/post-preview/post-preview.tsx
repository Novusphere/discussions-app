import * as React from 'react'
import moment from 'moment'
import { Votes } from '@components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import { TagModel } from '@models/tagModel'
import ReactMarkdown from 'react-markdown'
import { observer } from 'mobx-react'
import FeedModel from '@models/feedModel'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getThreadUrl } from '@utils'

interface IPostPreviewProps {
    post: FeedModel
    tag: TagModel
    notificationUuid?: string
    voteHandler?: (uuid: string, value: number) => Promise<void>
    disableVoteHandler?: boolean // in case voting needs to be disabled
}

const PostPreview: React.FC<IPostPreviewProps> = ({
    disableVoteHandler,
    post,
    tag,
    notificationUuid,
    voteHandler,
}) => {
    const [url, setUrl] = useState('')

    useEffect(() => {
        async function getUrl() {
            setUrl(await getThreadUrl(post, notificationUuid))
        }

        getUrl()
    }, [])

    return (
        <div className={'post-preview'} data-url={url}>
            <div className={'flex flex-auto'}>
                <div
                    className={
                        'bg-light-gray flex tc justify-center ph2 pv4 relative z-2 flex-auto'
                    }
                >
                    {disableVoteHandler ? null : (
                        <Votes
                            upVotes={post.upvotes}
                            downVotes={post.downvotes}
                            myVote={post.myVote}
                            handler={voteHandler}
                            uuid={post.uuid}
                        />
                    )}
                </div>
                <Link href={'/tag/[name]/[id]/[title]'} as={url}>
                    <a className={'no-style w-100'}>
                        <div className={'flex flex-column post-content w-100'}>
                            <div className={'flex f6 lh-copy black items-center'}>
                                {tag && (
                                    <img
                                        src={tag.icon}
                                        title={`${tag.name} icon`}
                                        className={'tag-image'}
                                    />
                                )}
                                <span className={'b ttu'}>{post.sub}</span>
                                <span className={'ph1 b'}>&#183;</span>
                                <span className={'o-80'}>by {post.displayName || post.poster}</span>
                                <span
                                    className={'o-50 pl2'}
                                    title={moment(post.createdAt)
                                        .toDate()
                                        .toLocaleString()}
                                >
                                    {moment(post.createdAt).fromNow()}
                                </span>
                            </div>
                            <div className={'flex justify-between items-center pt1'}>
                                <span className={'black f3 b lh-title'}>{post.title}</span>
                            </div>

                            <object>
                                <ReactMarkdown
                                    className={
                                        'black lh-copy measure-wide pt2 post-preview-content content-fade overflow-break-word'
                                    }
                                    source={post.content}
                                />
                            </object>

                            <div className={'flex z-2 footer b'}>
                                <span className={'o-80 f6 ml2 dim pointer'}>
                                    <FontAwesomeIcon
                                        width={13}
                                        icon={faComment}
                                        className={'pr2'}
                                    />
                                    {post.totalReplies} comments
                                </span>
                                <span className={'o-80 f6 ml2 dim pointer'}>share</span>
                                <span className={'o-80 f6 ml2 dim pointer'}>reply</span>
                                <span className={'o-80 f6 ml2 dim pointer'}>mark as spam</span>
                            </div>
                        </div>
                    </a>
                </Link>
            </div>
        </div>
    )
}

export default observer(PostPreview)
