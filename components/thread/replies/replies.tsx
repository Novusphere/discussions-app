import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign, faLink, faReply } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import { Link } from '@router'
import { Votes, Reply } from '@components'
import ReactMarkdown from 'react-markdown'
import { observer, Observer } from 'mobx-react'
import { ReplyModel } from '@models/replyModel'
import PostModel from '@models/postModel'
import classNames from 'classnames'
import { openInNewTab } from '@utils'

interface IReplies {
    post: PostModel
    className?: string
    getModel: (post: PostModel) => ReplyModel
    voteHandler: (uuid: string, value: number) => void
    getRepliesFromMap: (uid: string) => PostModel[]
}

const Replies: React.FC<IReplies> = ({
    post,
    voteHandler,
    getModel,
    getRepliesFromMap,
    className,
    ...props
}) => {
    const [isHover, setHover] = React.useState(false)
    const replyModel = getModel(post)
    const replies = getRepliesFromMap(post.uuid)

    // const renderBottomButtons = () => (
    //     <div className={'footer flex items-center pt1 ph2'}>
    //         <span className={'reply mr3 pointer dim'} onClick={replyModel.toggleOpen}>
    //             reply
    //         </span>
    //
    //         <FontAwesomeIcon width={13} icon={faLink} className={'pr2 black f6 pointer dim'} />
    //         <FontAwesomeIcon width={13} icon={faShare} className={'pr2 black f6 pointer dim'} />
    //
    //         <span className={'f6 black f6 pointer dim'}>
    //             <FontAwesomeIcon width={13} icon={faExclamationTriangle} className={'pr1'} />
    //             mark as spam
    //         </span>
    //     </div>
    // )

    const renderHoverElements = () => {
        if (!isHover) {
            return null
        }
        return (
            <div className={'hover-elements disable-user-select'}>
                <span onClick={replyModel.toggleOpen} title={'Reply to post'}>
                    <FontAwesomeIcon icon={faReply} />
                </span>
                <span title={'Donate tokens'}>
                    <FontAwesomeIcon icon={faDollarSign} />
                </span>
                <span
                    title={'View block'}
                    onClick={() => openInNewTab(`https://eosq.app/tx/${post.transaction}`)}
                >
                    <FontAwesomeIcon icon={faLink} />
                </span>
            </div>
        )
    }

    return (
        <Observer>
            {() => (
                <>
                    <div
                        className={classNames([
                            'post-reply black',
                            {
                                [className]: !!className,
                            },
                        ])}
                        {...props}
                        onMouseLeave={() => setHover(false)}
                        onMouseEnter={() => setHover(true)}
                    >
                        {renderHoverElements()}
                        <div
                            className={classNames([
                                'flex flex-row pa2',
                                {
                                    'post-content-hover': isHover,
                                },
                            ])}
                        >
                            <div className={'flex justify-between items-center mr2'}>
                                <Votes
                                    upVotes={post.upvotes}
                                    downVotes={post.downvotes}
                                    myVote={post.myVote}
                                    uuid={post.uuid}
                                    handler={voteHandler}
                                />
                            </div>
                            <div className={'flex flex-column'}>
                                <div className={'header pb0'}>
                                    <Link route={`/u/${post.displayName || post.poster}`}>
                                        <a>
                                            <span className={'f6'}>
                                                {post.displayName || post.poster}
                                            </span>
                                        </a>
                                    </Link>
                                    <span className={'pl2 o-50 f6'}>
                                        {moment(post.createdAt).fromNow()}
                                    </span>
                                </div>
                                <ReactMarkdown
                                    className={'f6 lh-copy reply-content'}
                                    source={post.content}
                                />
                            </div>
                        </div>

                        {/*{renderBottomButtons()}*/}

                        {replyModel.open ? (
                            <Reply
                                className={classNames([
                                    'ph4 pb4', {
                                        'post-content-hover': isHover,
                                    }
                                ])}
                                uid={post.uuid}
                                onContentChange={replyModel.setContent}
                                onSubmit={replyModel.onSubmit}
                            />
                        ) : null}

                        {replies && replies.length
                            ? replies.map((postReply, index) => (
                                  <div
                                      onMouseLeave={() => setHover(true)}
                                      onMouseEnter={() => setHover(false)}
                                      key={postReply.uuid}
                                  >
                                      <Replies
                                          post={postReply}
                                          getModel={getModel}
                                          className={'ml3'}
                                          getRepliesFromMap={getRepliesFromMap}
                                          voteHandler={voteHandler}
                                      />
                                  </div>
                              ))
                            : null}
                    </div>
                </>
            )}
        </Observer>
    )
}

export default observer(Replies)
