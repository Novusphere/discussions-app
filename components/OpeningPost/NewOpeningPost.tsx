import * as React from 'react'
import Link from 'next/link'
import {
    Form,
    ReplyBox,
    RichTextPreview,
    SharePost,
    Tips,
    UserNameWithIcon,
    VotingHandles,
} from '@components'
import moment from 'moment'
import { Post } from '@novuspherejs'
import { inject, observer } from 'mobx-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEye,
    faEyeSlash,
    faLink,
    faPen,
    faReply,
    faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import { NextRouter } from 'next/router'
import { IStores } from '@stores'
import { autorun, IReactionDisposer } from 'mobx'

interface INewOpeningPostOuterProps {
    router: NextRouter
    openingPost: Post
}

interface INewOpeningPostInnerProps {
    authStore: IStores['authStore']
    uiStore: IStores['uiStore']
    userStore: IStores['userStore']
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    settingsStore: IStores['settingsStore']
}

@inject('authStore', 'uiStore', 'userStore', 'tagStore', 'postsStore', 'settingsStore')
@observer
class NewOpeningPost extends React.Component<
    INewOpeningPostOuterProps & INewOpeningPostInnerProps,
    any
> {
    private disposer: IReactionDisposer = null

    constructor(props) {
        super(props)

        this.state = {
            myVote: props.openingPost.myVote,
            upvotes: props.openingPost.upvotes,
            downvotes: props.openingPost.downvotes,

            threadEditing: false,
        }
    }

    componentDidMount(): void {
        this.disposer = autorun(() => {
            if (this.props.postsStore.activeThread) {
                this.setState({
                    editing: this.props.postsStore.activeThread.editing,
                })
            }
        })
    }

    componentWillUnmount(): void {
        this.disposer()
    }

    // TODO: FIX THIS
    private handleVoting = async (uuid, myNewVote) => {
        console.log('new vote: ', myNewVote)
        const type = myNewVote === 1 ? 'upvotes' : 'downvotes'
        let currentVote = this.state[type]

        // if user has already voted
        const { myVote: myPreviousVote, upvotes, downvotes } = this.state

        if (myPreviousVote === 1 && myNewVote === 0) {
            currentVote = upvotes - 1
        } else if (myPreviousVote === -1 && myNewVote === 0) {
            currentVote = downvotes + 1
        } else {
            currentVote = currentVote + myNewVote
        }

        try {
            this.setState(
                {
                    myVote: myNewVote,
                    [type]: currentVote,
                },
                () => {
                    console.log(this.state)
                }
            )

            // await thread.vote(uuid, myNewVote)
        } catch (error) {
            throw error
        }
    }

    private handleWatchPost = (id, replies) => {
        if (!this.props.authStore.hasAccount) {
            this.props.uiStore.showToast('You must be logged in to watch posts', 'error')
            return
        }
        this.props.userStore.toggleThreadWatch(id, replies)
    }

    private addAsModerator = () => {
        const {
            props: {
                openingPost,
                userStore: { setModerationMemberByTag },
                tagStore: { activeTag },
            },
        } = this

        const mergedNameWithPub = `${openingPost.displayName}:${openingPost.pub}`
        setModerationMemberByTag(mergedNameWithPub, activeTag.name)
    }

    private renderOpeningPost = () => {
        const { myVote, upvotes, downvotes } = this.state
        const {
            router,
            openingPost,
            authStore: { supportedTokensImages },
            postsStore: { activeThread },
            userStore: { toggleBlockPost, isWatchingThread, blockedPosts },
        } = this.props

        const id = router.query.id as string
        const asPath = router.asPath

        return (
            <div data-post-uuid={openingPost.uuid}>
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
                                name={openingPost.displayName}
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
                            <Tips tokenImages={supportedTokensImages} tips={openingPost.tips} />
                        </div>

                        {!this.state.editing && (
                            <div className={'flex justify-between items-center pb1'}>
                                <span className={'black f4 b'}>{openingPost.title}</span>
                                <VotingHandles
                                    uuid={openingPost.uuid}
                                    myVote={myVote}
                                    upVotes={upvotes}
                                    downVotes={downvotes}
                                    handler={this.handleVoting}
                                />
                            </div>
                        )}

                        {activeThread && activeThread.editing ? (
                            <Form form={activeThread.editForm} hideSubmitButton />
                        ) : (
                            <RichTextPreview className={'black f6 lh-copy overflow-break-word'}>
                                {openingPost.content}
                            </RichTextPreview>
                        )}

                        {activeThread && activeThread.openingPost && (
                            <div className={'footer flex items-center pt3'}>
                                <div className={'flex flex-row w-100 items-center justify-between'}>
                                    <div>
                                        <button
                                            className={'reply mr3 pointer dim'}
                                            onClick={activeThread.openingPostReplyModel.toggleOpen}
                                        >
                                            <FontAwesomeIcon
                                                fixedWidth
                                                width={13}
                                                icon={faReply}
                                                className={'pr1'}
                                            />
                                            reply
                                        </button>

                                        {activeThread.canEditPost && (
                                            <span
                                                className={'mr3 black f6 pointer dim'}
                                                title={'Edit post'}
                                                onClick={() => activeThread.toggleEditing()}
                                            >
                                                <FontAwesomeIcon icon={faPen} color={'#929292'} />
                                            </span>
                                        )}

                                        <span
                                            className={'mr3 black f6 pointer dim'}
                                            title={
                                                !isWatchingThread(id)
                                                    ? 'Watch Post'
                                                    : 'Unwatch Post'
                                            }
                                            onClick={() =>
                                                this.handleWatchPost(id, activeThread.totalReplies)
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={!isWatchingThread(id) ? faEyeSlash : faEye}
                                                color={isWatchingThread(id) ? '#079E99' : '#b0b0b0'}
                                            />
                                        </span>

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
                                        isBlockedPost={blockedPosts.has(asPath)}
                                        toggleBlockPost={toggleBlockPost}
                                        toggleAddAsModerator={this.addAsModerator}
                                        id={asPath.split('#')[0]}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    private renderOpeningPostReplyBox = () => {
        if (!this.props.postsStore.activeThread) {
            return <FontAwesomeIcon width={13} icon={faSpinner} spin />
        }

        const {
            postsStore: {
                setCurrentReplyContent,
                activeThread: { uuid, openingPostReplyModel },
            },
        } = this.props

        const { onSubmit, content, open, setContent } = openingPostReplyModel

        return (
            <div className={'mb3'}>
                <ReplyBox
                    open={open}
                    uid={uuid}
                    onContentChange={content => {
                        setContent(content)
                        setCurrentReplyContent(content)
                    }}
                    onSubmit={() => onSubmit(this.props.postsStore.activeThread)}
                    loading={onSubmit['pending']}
                    value={content}
                />
            </div>
        )
    }

    private renderReplyCount = () => {
        const { openingPost } = this.props

        return (
            <>
                {openingPost.totalReplies > 0 && (
                    <div className={'mb2'} id={'comments'}>
                        <span className={'b f6 pb2'}>
                            viewing all {openingPost.totalReplies} comments
                        </span>
                    </div>
                )}
            </>
        )
    }

    render() {
        const { openingPost } = this.props

        return (
            <>
                {this.renderOpeningPost()}
                {this.renderOpeningPostReplyBox()}
                {this.renderReplyCount()}
            </>
        )
    }
}

export default NewOpeningPost as React.ComponentClass<INewOpeningPostOuterProps>
