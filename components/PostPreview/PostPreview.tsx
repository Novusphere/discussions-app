import * as React from 'react'
import moment from 'moment'
import { RichTextPreview, UserNameWithIcon, VotingHandles } from '@components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import { TagModel } from '@models/tagModel'
import { observer } from 'mobx-react'
import FeedModel from '@models/feedModel'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getThreadUrl } from '@utils'
import { Post } from '@novuspherejs'
import { BlockedContentSetting } from '@stores/settingsStore'
import { ObservableMap } from 'mobx'

interface IPostPreviewProps {
    post: Post
    tag: TagModel
    notificationUuid?: string
    voteHandler?: (uuid: string, value: number) => Promise<void>
    disableVoteHandler?: boolean // in case voting needs to be disabled
    blockedContentSetting: BlockedContentSetting
    blockedPosts: ObservableMap<string, string>
    blockedUsers: ObservableMap<string, string>
    unsignedPostsIsSpam: boolean
}

const PostPreview: React.FC<IPostPreviewProps> = ({
    disableVoteHandler,
    post,
    tag,
    notificationUuid,
    voteHandler,
    blockedContentSetting,
    blockedPosts,
    blockedUsers,
}) => {
    const [url, setUrl] = useState('')
    const [postModel, setPostModel] = useState(null)

    useEffect(() => {
        function makePostIntoFeedModel() {
            setPostModel(new FeedModel(post))
        }

        async function getUrl() {
            let uuid = undefined

            if (!post.title && notificationUuid) {
                uuid = notificationUuid
            }

            setUrl(await getThreadUrl(post, uuid))
        }

        makePostIntoFeedModel()
        getUrl()
    }, [])

    const isSpam = blockedPosts.has(url) || blockedUsers.has(post.pub) || !post.sig
    const shouldBeCollapsed = blockedContentSetting === 'collapsed' && isSpam
    const shouldBeHidden = isSpam && blockedContentSetting === 'hidden'

    if (shouldBeHidden) {
        return null
    }

    return (
        <div
            className={'post-preview'}
            data-url={url}
            style={{
                opacity: isSpam && blockedContentSetting === 'collapsed' ? 0.5 : 1,
            }}
        >
            <div className={'flex flex-auto'}>
                <div
                    className={
                        'bg-light-gray flex tc justify-center ph2 pv4 relative z-2 flex-auto'
                    }
                    style={{ width: '40px' }}
                >
                    {disableVoteHandler || isSpam
                        ? null
                        : postModel && (
                              <VotingHandles
                                  upVotes={postModel.upvotes}
                                  downVotes={postModel.downvotes}
                                  myVote={postModel.myVote}
                                  handler={postModel.vote}
                                  uuid={postModel.uuid}
                              />
                          )}
                </div>
                <Link href={'/tag/[name]/[id]/[title]'} as={url}>
                    <a className={'no-style w-100'}>
                        <div className={'flex flex-column post-content w-100'}>
                            {shouldBeCollapsed && (
                                <span className={'silver'}>This post was marked as spam.</span>
                            )}
                            {!shouldBeCollapsed && (
                                <>
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
                                        {postModel && (
                                            <UserNameWithIcon
                                                imageData={postModel.imageData}
                                                pub={postModel.pub}
                                                name={postModel.posterName}
                                                imageSize={20}
                                            />
                                        )}
                                        <span className={'ph1 b'}>&#183;</span>
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

                                    <RichTextPreview>{post.content}</RichTextPreview>

                                    <div className={'flex z-2 footer b'}>
                                        <object>
                                            <Link
                                                href={'/tag/[name]/[id]/[title]'}
                                                as={`${url}#comments`}
                                            >
                                                <a className={'o-80 f6 ml2 dim pointer'}>
                                                    <FontAwesomeIcon
                                                        width={13}
                                                        icon={faComment}
                                                        className={'pr2'}
                                                    />
                                                    {post.totalReplies} comments
                                                </a>
                                            </Link>
                                        </object>
                                        <span className={'o-80 f6 ml2 dim pointer'}>share</span>
                                        <span className={'o-80 f6 ml2 dim pointer'}>reply</span>
                                        <span className={'o-80 f6 ml2 dim pointer'}>
                                            mark as spam
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </a>
                </Link>
            </div>
        </div>
    )
}

export default observer(PostPreview)
