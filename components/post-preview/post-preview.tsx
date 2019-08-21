import * as React from 'react'
import moment from 'moment'
import { Votes } from '@components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import { TagModel } from '@models/tagModel'
import ReactMarkdown from 'react-markdown'
import { observer } from 'mobx-react'
import FeedModel from '@models/feedModel'

interface IPostPreviewProps {
    onClick: (post) => void
    post: FeedModel
    tag: TagModel
    voteHandler?: (uuid: string, value: number) => Promise<void>
    disableVoteHandler?: boolean // in case voting needs to be disabled
}

const PostPreview: React.FC<IPostPreviewProps> = ({
    disableVoteHandler,
    post,
    onClick,
    tag,
    voteHandler,
}) => (
    <div className={'post-preview'}>
        <div className={'flex flex-auto'}>
            <div className={'bg-light-gray flex tc justify-center ph2 pv4 relative z-2 flex-auto'}>
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
            <div
                className={'flex flex-column post-content w-100'}
                onClick={() => onClick(post)}
            >
                <div className={'flex f6 lh-copy black items-center'}>
                    <img src={tag.icon} title={`${tag.name} icon`} className={'tag-image'} />
                    <span className={'b ttu'}>{post.sub}</span>
                    <span className={'ph1 b'}>&#183;</span>
                    <span className={'o-80'}>by {post.poster}</span>
                    <span className={'o-50 pl2'}>{moment(post.createdAt).fromNow()}</span>
                </div>
                <div className={'flex justify-between items-center pt1'}>
                    <span className={'black f3 b lh-title'}>{post.title}</span>
                </div>

                <ReactMarkdown
                    className={'black lh-copy measure-wide pt2 post-preview-content content-fade'}
                    source={post.content}
                />

                <div className={'flex z-2 footer b'}>
                    <span className={'o-80 f6 ml2 dim pointer'}>
                        <FontAwesomeIcon width={13} icon={faComment} className={'pr2'} />
                        {post.totalReplies} comments
                    </span>
                    <span className={'o-80 f6 ml2 dim pointer'}>share</span>
                    <span className={'o-80 f6 ml2 dim pointer'}>reply</span>
                    <span className={'o-80 f6 ml2 dim pointer'}>mark as spam</span>
                </div>
            </div>
        </div>
    </div>
)

export default observer(PostPreview)
