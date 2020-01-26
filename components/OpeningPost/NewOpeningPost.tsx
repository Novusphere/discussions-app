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
import { Post, Thread } from '@novuspherejs'
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
import { generateVoteObject, getIdenticon, sleep, voteAsync } from '@utils'

interface INewOpeningPostOuterProps {
    router: NextRouter
    openingPost: Post
    activeThread: Thread
    addReplies: (reply) => void
}

interface INewOpeningPostInnerProps {
    authStore: IStores['authStore']
    uiStore: IStores['uiStore']
    userStore: IStores['userStore']
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    settingsStore: IStores['settingsStore']
}

interface INewOpeningPostState {
    myVote: any[]
    myVoteValue: number
    upvotes: number
    downvotes: number
    threadEditing: boolean
    openingPost: any
}

@inject('authStore', 'uiStore', 'userStore', 'tagStore', 'postsStore', 'settingsStore')
@observer
class NewOpeningPost extends React.Component<
    INewOpeningPostOuterProps & INewOpeningPostInnerProps,
    INewOpeningPostState
> {
    private disposer: IReactionDisposer = null

    constructor(props) {
        super(props)

        this.state = {
            openingPost: props.openingPost,
            myVote: props.openingPost.myVote,
            myVoteValue:
                props.openingPost.myVote && props.openingPost.myVote.length > 0
                    ? props.openingPost.myVote[0].value
                    : 0,
            upvotes: props.openingPost.upvotes,
            downvotes: props.openingPost.downvotes,

            threadEditing: false,
        }
    }

    componentDidUpdate(
        prevProps: Readonly<INewOpeningPostOuterProps & INewOpeningPostInnerProps>,
        prevState: Readonly<INewOpeningPostState>,
        snapshot?: any
    ): void {
        if (!prevProps.activeThread && this.props.activeThread) {
            this.setState({
                myVote: this.props.activeThread.openingPost.myVote,
                myVoteValue:
                    this.props.activeThread.openingPost.myVote &&
                    this.props.activeThread.openingPost.myVote.length > 0
                        ? this.props.activeThread.openingPost.myVote[0].value
                        : 0,
                upvotes: this.props.activeThread.openingPost.upvotes,
                downvotes: this.props.activeThread.openingPost.downvotes,
            })
        }
    }

    componentDidMount(): void {
        this.disposer = autorun(() => {
            if (this.props.postsStore.activeThread) {
                this.setState({
                    threadEditing: this.props.postsStore.activeThread.editing,
                })
            }
        })
    }

    componentWillUnmount(): void {
        this.disposer()
    }

    private submitEdit = async () => {
        try {
            const response = await this.props.postsStore.activeThread.saveEdits(
                this.props.postsStore.activeThread.editForm.form
            )
            response.imageData = getIdenticon(this.props.authStore.activePublicKey)

            this.setState({
                openingPost: response,
            })
        } catch (error) {
            return
        }
    }

    private handleVoting = async (e, uuid, value) => {
        let type

        switch (value) {
            case 1:
                type = 'upvote'
                break
            case -1:
                type = 'downvote'
                break
        }

        try {
            const { myVoteValue } = this.state

            // check if your prev vote was positive
            if (myVoteValue === 1) {
                // what type of vote are you doing
                if (type === 'downvote') {
                    this.setState(prevState => ({
                        upvotes: prevState.upvotes - 1,
                        downvotes: prevState.downvotes + 1,
                        myVoteValue: -1,
                    }))
                }

                if (type === 'upvote') {
                    this.setState(prevState => ({
                        upvotes: prevState.upvotes - 1,
                        myVoteValue: 0,
                    }))
                }
            }

            // check if your prev vote was negative
            if (myVoteValue === -1) {
                // what type of vote are you doing
                if (type === 'downvote') {
                    this.setState(prevState => ({
                        upvotes: prevState.upvotes + 1,
                        myVoteValue: 0,
                    }))
                }

                if (type === 'upvote') {
                    this.setState(prevState => ({
                        upvotes: prevState.upvotes + 1,
                        downvotes: prevState.downvotes - 1,
                        myVoteValue: 1,
                    }))
                }
            }

            // you never voted
            if (myVoteValue === 0) {
                if (type === 'downvote') {
                    this.setState(prevState => ({
                        downvotes: prevState.downvotes + 1,
                        myVoteValue: -1,
                    }))
                }

                if (type === 'upvote') {
                    this.setState(prevState => ({
                        myVoteValue: 1,
                        upvotes: prevState.upvotes + 1,
                    }))
                }
            }

            await sleep(50)

            const voteObject = generateVoteObject({
                uuid,
                postPriv: this.props.authStore.postPriv,
                value: this.state.myVoteValue,
            })

            const data = await voteAsync({
                voter: '',
                uuid,
                value: this.state.myVoteValue,
                nonce: voteObject.nonce,
                pub: voteObject.pub,
                sig: voteObject.sig,
            })

            if (data.error) {
                this.props.uiStore.showToast(`Failed to ${type.split('s')[0]} this post`, 'error')
            }

            e.persist()
        } catch (error) {
            this.props.uiStore.showToast(error.message, 'error')
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
        const { myVote, myVoteValue, upvotes, downvotes, openingPost } = this.state
        const {
            router,
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

                        {!this.state.threadEditing && (
                            <div className={'flex justify-between items-center pb1'}>
                                <span className={'black f4 b'}>{openingPost.title}</span>
                                <VotingHandles
                                    uuid={openingPost.uuid}
                                    myVote={myVoteValue}
                                    upVotes={upvotes}
                                    downVotes={downvotes}
                                    handler={this.handleVoting}
                                />
                            </div>
                        )}

                        {activeThread && activeThread.editing ? (
                            <>
                                <Form form={activeThread.editForm} hideSubmitButton />
                                <div className={'flex flex-row items-center justify-start pb3'}>
                                    <button
                                        className={
                                            'f6 link dim ph3 pv2 dib mr1 pointer white bg-red'
                                        }
                                        onClick={() => activeThread.toggleEditing()}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={activeThread.saveEdits['pending']}
                                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                        onClick={this.submitEdit}
                                    >
                                        {activeThread.saveEdits['pending'] ? (
                                            <FontAwesomeIcon width={13} icon={faSpinner} spin />
                                        ) : (
                                            'Save Edit'
                                        )}
                                    </button>
                                </div>
                            </>
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

    private onSubmit = async () => {
        const reply = await this.props.postsStore.activeThread.openingPostReplyModel.onSubmit(
            this.props.postsStore.activeThread
        )

        reply.imageData = getIdenticon(this.props.authStore.activePublicKey)
        reply.myVote = [{ value: 1 }]
        this.props.addReplies(reply)
    }

    private renderOpeningPostReplyBox = () => {
        if (!this.props.postsStore.activeThread) {
            return <FontAwesomeIcon width={13} icon={faSpinner} spin />
        }

        const {
            postsStore: {
                activeThread: { uuid, openingPostReplyModel },
            },
        } = this.props

        const { onSubmit, content, open, setContent } = openingPostReplyModel

        return (
            <ReplyBox
                open={open}
                uid={uuid}
                onContentChange={setContent}
                onSubmit={this.onSubmit}
                loading={onSubmit['pending']}
                value={content}
            />
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
        return (
            <>
                {this.renderOpeningPost()}
                <div className={'mb3'} style={{ minHeight: '100px' }}>
                    {this.renderOpeningPostReplyBox()}
                </div>
                {this.renderReplyCount()}
            </>
        )
    }
}

export default NewOpeningPost as React.ComponentClass<INewOpeningPostOuterProps>
