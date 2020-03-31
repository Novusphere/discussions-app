import React, { useEffect, useCallback, useState, useLayoutEffect } from 'react'
import { useLocalStore } from 'mobx-react-lite'
import { discussions, Thread } from '@novuspherejs'
import { Button, Divider, Dropdown, Icon, Menu, Popover, Tooltip, Result, Input, Empty } from 'antd'
import {
    UserNameWithIcon,
    Tips,
    VotingHandles,
    RichTextPreview,
    Replies,
    Icons,
    SharePostPopover,
    Editor,
    ReplyingPostPreview,
} from '@components'
import moment from 'moment'
import _ from 'lodash'
import {
    createPostObject,
    generateVoteObject,
    getThreadUrl,
    openInNewTab,
    signPost,
    transformTipsToTransfers,
    transformTipToMetadata,
    voteAsync,
} from '@utils'
import { RootStore, useStores } from '@stores'
import { MODAL_OPTIONS } from '@globals'
import cx from 'classnames'
import { observer } from 'mobx-react'
import Helmet from 'react-helmet'
import { Link, useLocation, useParams } from 'react-router-dom'

import { animateScroll, scroller } from 'react-scroll'

interface IPostPageProps {
    thread: Thread
    url: string
    query: {
        tag: string
        id: string
        title: string
    }
}

const PostPageComponentObserverable: React.FunctionComponent<IPostPageProps> = ({
    thread,
    url,
    query: { tag: name, id, title },
}) => {
    const {
        userStore,
        settingStore,
        authStore,
        uiStore,
        walletStore,
        tagStore,
    }: RootStore = useStores()

    const postStore = useLocalStore(
        source => ({
            observableThread: source.thread,
            myVote: source.thread.openingPost.myVote,
            downvotes: source.thread.openingPost.downvotes,
            upvotes: source.thread.openingPost.upvotes,
            highlightedPostUUID: '',
            showPreview: false,

            get myVoteValue() {
                if (postStore.myVote && postStore.myVote.length) {
                    return postStore.myVote[0].value
                }

                return 0
            },

            get threadUsers() {
                return _.uniqBy(
                    _.map(
                        _.filter(postStore.observableThread.map, (posts: any) => posts.pub.length),
                        posts => {
                            let poster = posts.poster

                            if (poster === 'eosforumanon') {
                                poster = posts.displayName
                            }

                            return {
                                id: `${posts.pub}-${posts.uidw}`,
                                value: poster,
                                icon: posts.imageData,
                            }
                        }
                    ),
                    option => option.id
                )
            },

            setHighlightedPosUUID: (uuid: string) => {
                postStore.highlightedPostUUID = uuid
            },

            /**
             * Editing
             */
            editing: false,
            submitEditLoading: false,
            titleContent: source.thread.openingPost.title,
            editingContent: source.thread.openingPost.content,

            setTitleContent: (e: any) => {
                postStore.titleContent = e.target.value
            },

            setEditingContent: (content: string) => {
                postStore.editingContent = content
            },

            togglePreview: () => {
                postStore.showPreview = !postStore.showPreview
            },

            toggleEdit: () => {
                postStore.editing = !postStore.editing
            },

            submitEdit: async () => {
                postStore.submitEditLoading = true

                const postObject = createPostObject({
                    title: postStore.titleContent,
                    content: postStore.editingContent,
                    sub: thread.openingPost.sub,
                    parentUuid: thread.openingPost.uuid,
                    threadUuid: thread.openingPost.threadUuid,
                    uidw: authStore.uidwWalletPubKey,
                    pub: thread.openingPost.pub,
                    posterName: authStore.displayName,
                    postPub: authStore.postPub,
                    postPriv: authStore.postPriv,
                    isEdit: true,
                })

                try {
                    const { sig } = signPost({
                        privKey: authStore.postPriv,
                        uuid: postObject.uuid,
                        content: postObject.content,
                    })

                    postObject.sig = sig

                    const { editedAt, uuid } = await discussions.post(postObject as any)

                    return new Promise((resolve, reject) => {
                        const int = setInterval(async () => {
                            const submitted = await discussions.wasEditSubmitted(
                                postStore.observableThread.openingPost.transaction,
                                uuid
                            )

                            if (submitted) {
                                clearInterval(int)
                                postObject.myVote = [{ value: 1 }]
                                postStore.toggleEdit()
                                postStore.submitEditLoading = false
                                postStore.titleContent = postObject.title
                                postStore.setEditingContent(postObject.content)
                                postStore.observableThread.openingPost.edit = true
                                postStore.observableThread.openingPost.editedAt = editedAt

                                uiStore.showToast('Success', 'Your edit was submitted', 'success')

                                return resolve()
                            }
                        }, 2000)
                    })
                } catch (error) {
                    let message = 'Your reply failed to submit'

                    if (error.message) {
                        message = error.message
                    }

                    postStore.submitEditLoading = false
                    uiStore.showToast('Failed', message, 'error')
                    return error
                }
            },

            /**
             * Replying
             **/
            replying: true,
            submitReplyLoading: false,
            replyingContent: '',
            setReplyContent: (content: string) => {
                postStore.replyingContent = content
            },

            toggleReply: () => {
                postStore.replying = !postStore.replying
            },

            waitForUserInput: (cb: (walletPassword: string) => void) => {
                const int = setInterval(() => {
                    if (uiStore.activeModal === MODAL_OPTIONS.none) {
                        clearInterval(int)
                        return cb('incomplete')
                    }

                    const { TEMP_WalletPrivateKey } = authStore

                    if (TEMP_WalletPrivateKey) {
                        clearInterval(int)
                        return cb(TEMP_WalletPrivateKey)
                    }
                }, 250)
            },

            submitReply: async () => {
                try {
                    if (!authStore.hasAccount) {
                        return uiStore.showToast('Failed', 'Please log in to reply', 'error')
                    }

                    postStore.submitReplyLoading = true

                    // create a post object
                    const postObject = createPostObject({
                        title: '',
                        content: postStore.replyingContent,
                        sub: postStore.observableThread.openingPost.sub,
                        parentUuid: postStore.observableThread.openingPost.uuid,
                        threadUuid: postStore.observableThread.openingPost.threadUuid,
                        uidw: authStore.uidwWalletPubKey,
                        pub: postStore.observableThread.openingPost.pub,
                        posterName: authStore.displayName,
                        postPub: authStore.postPub,
                        postPriv: authStore.postPriv,
                    })

                    if (postObject.transfers.length > 0) {
                        // ask for password
                        uiStore.setActiveModal(MODAL_OPTIONS.walletActionPasswordReentry)

                        const transferData = postObject.transfers.map(transfer => {
                            return transformTipToMetadata({
                                tip: transfer,
                                tokens: walletStore.supportedTokensForUnifiedWallet,
                                replyingToUIDW: postStore.observableThread.openingPost.uidw,
                                replyingToDisplayName:
                                    postStore.observableThread.openingPost.displayName,
                                replyingToPostPub: postStore.observableThread.openingPost.pub,
                            })
                        })

                        authStore.setTEMPTransfers(transferData)

                        postStore.waitForUserInput(async walletPrivateKey => {
                            if (walletPrivateKey === 'incomplete') {
                                postStore.submitReplyLoading = false
                                uiStore.showToast('Failed', 'User cancelled transaction', 'error')
                                return
                            }
                            const _cached = `${walletPrivateKey}`
                            authStore.setTEMPPrivateKey('')
                            uiStore.clearActiveModal()

                            if (!postStore.observableThread.openingPost.tips) {
                                postStore.observableThread.openingPost.tips = {} as any
                            }

                            postObject.transfers = transformTipsToTransfers({
                                tips: postObject.transfers,
                                replyingToUIDW: postStore.observableThread.openingPost.uidw,
                                replyingToDisplayName:
                                    postStore.observableThread.openingPost.displayName,
                                privateKey: _cached,
                                tokens: walletStore.supportedTokensForUnifiedWallet,
                                replyingToPostPub: postStore.observableThread.openingPost.pub,
                            })

                            await postStore.finishSubmitting(postObject)
                        })
                    } else {
                        await postStore.finishSubmitting(postObject)
                    }
                } catch (error) {
                    throw error
                }
            },

            finishSubmitting: async (postObject: any) => {
                try {
                    const { sig } = signPost({
                        privKey: authStore.postPriv,
                        uuid: postObject.uuid,
                        content: postObject.content,
                    })

                    postObject.sig = sig

                    const { transaction } = await discussions.post(postObject)

                    postObject.myVote = [{ value: 1 }]
                    postStore.observableThread.openingPost.replies.push(postObject)
                    postStore.observableThread.openingPost.totalReplies += 1
                    postStore.submitReplyLoading = false
                    postStore.setReplyContent('')
                    postStore.toggleReply()

                    uiStore.showToast('Success', 'Your reply has been submitted', 'success', {
                        btn: (
                            <Button
                                size="small"
                                onClick={() =>
                                    openInNewTab(`https://bloks.io/transaction/${transaction}`)
                                }
                            >
                                View transaction
                            </Button>
                        ),
                    })
                } catch (error) {
                    let message = 'Your reply failed to submit'

                    if (error.message) {
                        message = error.message
                    }

                    postStore.submitReplyLoading = false
                    uiStore.showToast('Failed', message, 'error')
                    return error
                }
            },

            handleVoting: async (e: any, uuid: string, value: any) => {
                if (!authStore.hasAccount) {
                    return uiStore.showToast('Error', 'Please log in to vote', 'error')
                }

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
                    const myVoteValue = postStore.myVoteValue

                    // check if your prev vote was positive
                    if (myVoteValue === 1) {
                        // what type of vote are you doing
                        if (type === 'downvote') {
                            postStore.upvotes -= 1
                            postStore.downvotes += 1
                            postStore.myVote = [{ value: -1 }]
                        }

                        if (type === 'upvote') {
                            postStore.upvotes -= 1
                            postStore.myVote = [{ value: 0 }]
                        }
                    }

                    // check if your prev vote was negative
                    if (myVoteValue === -1) {
                        // what type of vote are you doing
                        if (type === 'downvote') {
                            postStore.upvotes += 1
                            postStore.myVote = [{ value: 0 }]
                        }

                        if (type === 'upvote') {
                            postStore.upvotes += 1
                            postStore.downvotes -= 1
                            postStore.myVote = [{ value: 1 }]
                        }
                    }

                    // you never voted
                    if (myVoteValue === 0) {
                        if (type === 'downvote') {
                            postStore.downvotes += 1
                            postStore.myVote = [{ value: -1 }]
                        }
                        //
                        if (type === 'upvote') {
                            postStore.upvotes += 1
                            postStore.myVote = [{ value: 1 }]
                        }
                    }

                    const voteObject = generateVoteObject({
                        uuid,
                        postPriv: authStore.postPriv,
                        value: postStore.myVoteValue,
                    })

                    const data = await voteAsync({
                        voter: '',
                        uuid,
                        value: postStore.myVoteValue,
                        nonce: voteObject.nonce,
                        pub: voteObject.pub,
                        sig: voteObject.sig,
                    })

                    if (data.error) {
                        uiStore.showToast(
                            'Failed',
                            `Failed to ${type.split('s')[0]} this post`,
                            'error'
                        )
                    }
                } catch (error) {
                    uiStore.showToast('Failed', error.message, 'error')
                }
            },
        }),
        {
            thread,
        }
    )

    const location = useLocation()

    useLayoutEffect(() => {
        setTimeout(() => {
            if (location.hash) {
                const hash = location.hash.split('#')[1]
                postStore.setHighlightedPosUUID(hash)
                scroller.scrollTo(hash, {
                    duration: 800,
                    smooth: true,
                    offset: -75,
                })
            }
        }, 500)

        return () => {
            postStore.setHighlightedPosUUID('')
        }
    }, [location])

    const isSameUser = postStore.observableThread.openingPost.pub == authStore.postPub
    const menu = (
        <Menu>
            <Menu.Item>
                <a
                    className={'flex flex-row items-center'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => userStore.toggleBlockPost(url)}
                >
                    <Icon
                        type="delete"
                        className={'mr2'}
                        theme="twoTone"
                        twoToneColor={'#E7040F'}
                    />
                    {userStore.blockedPosts.has(url) ? 'Unblock post' : 'Block post'}
                </a>
            </Menu.Item>
            {!isSameUser && (
                <Menu.Item>
                    <a
                        className={'flex flex-row items-center'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                            userStore.setModerationMemberByTag(
                                `${thread.openingPost.displayName}:${thread.openingPost.pub}`,
                                thread.openingPost.sub
                            )
                        }
                    >
                        <Icon
                            type="safety-certificate"
                            theme="twoTone"
                            className={'mr2'}
                            twoToneColor={'#D5008F'}
                        />
                        {userStore.delegated.has(
                            `${thread.openingPost.displayName}:${thread.openingPost.pub}:${thread.openingPost.sub}`
                        )
                            ? 'Remove'
                            : 'Add'}{' '}
                        {thread.openingPost.displayName} as moderator
                    </a>
                </Menu.Item>
            )}
            <Menu.Item>
                <a
                    className={'flex flex-row items-center'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => userStore.togglePinPost(name, url)}
                >
                    <Icon
                        type="pushpin"
                        className={'mr2'}
                        theme="twoTone"
                        twoToneColor={'#FFD700'}
                    />
                    {userStore.pinnedPosts.has(url) ? 'Un-pin thread' : 'Pin this thread'}
                </a>
            </Menu.Item>
        </Menu>
    )

    const DropdownMenu = () => {
        return (
            <Dropdown key="more" overlay={menu}>
                <Button
                    size={'small'}
                    icon={'ellipsis'}
                    title={'View more options'}
                    disabled={postStore.editing}
                />
            </Dropdown>
        )
    }

    const shouldBeHidden =
        userStore.blockedPosts.has(url) && userStore.blockedContentSetting === 'hidden'

    if (shouldBeHidden) {
        return (
            <Result
                icon={<Icon type="exclamation-circle" theme={'twoTone'} twoToneColor={'#FF4136'} />}
                title={'This post is blocked!'}
                subTitle={
                    'You or a moderator marked this post as spam. You can unblock this post in your settings.'
                }
                extra={[
                    <Link to={`/tag/${thread.openingPost.sub}`}>
                        <Button
                            title={`See all posts in ${name}`}
                            icon={'caret-left'}
                            type={'primary'}
                        >
                            Back to #{name}
                        </Button>
                    </Link>,
                ]}
            />
        )
    }

    const tag = tagStore.tagModelFromObservables(thread.openingPost.sub)

    if (!tag) return null

    return (
        <div id={'thread'}>
            <Link to={`/tag/${thread.openingPost.sub}`}>
                <Button title={`See all posts in ${name}`} icon={'caret-left'}>
                    <span className={'flex flex-row items-center'}>
                        <img
                            className={'dib'}
                            src={tag.logo}
                            alt={`${thread.openingPost.sub} icon`}
                            width={25}
                        />
                        <span className={'dib ml1'}>#{name}</span>
                    </span>
                </Button>
            </Link>

            <div className={'bg-white mv2 pa4 card'}>
                <div className={'flex flex-row items-center justify-between'}>
                    <div className={'flex flex-row items-center'}>
                        <Link to={`/tag/${thread.openingPost.sub}`}>
                            <span className={'b'}>#{thread.openingPost.sub}</span>
                        </Link>
                        <Divider type={'vertical'} />
                        <UserNameWithIcon
                            imageData={thread.openingPost.imageData}
                            pub={thread.openingPost.pub}
                            name={thread.openingPost.displayName}
                        />
                        <Divider type={'vertical'} />
                        <Tooltip
                            title={moment(
                                postStore.observableThread.openingPost.edit
                                    ? postStore.observableThread.openingPost.editedAt
                                    : postStore.observableThread.openingPost.createdAt
                            ).format('YYYY-MM-DD HH:mm:ss')}
                        >
                            <span className={'light-silver f6'}>
                                {postStore.observableThread.openingPost.edit && 'edited '}{' '}
                                {moment(
                                    postStore.observableThread.openingPost.edit
                                        ? postStore.observableThread.openingPost.editedAt
                                        : postStore.observableThread.openingPost.createdAt
                                ).fromNow()}
                            </span>
                        </Tooltip>
                    </div>
                    <Tips tips={thread.openingPost.tips} />
                </div>

                <div
                    className={cx([
                        'mv3 flex-row justify-between',
                        {
                            dn: postStore.editing,
                            flex: !postStore.editing,
                        },
                    ])}
                >
                    <span className={'measure black b f4 flex-wrap'}>{postStore.titleContent}</span>
                    <VotingHandles
                        uuid={thread.openingPost.uuid}
                        myVote={postStore.myVoteValue}
                        upVotes={postStore.upvotes}
                        downVotes={postStore.downvotes}
                        handler={postStore.handleVoting}
                    />
                </div>

                <div className={'mt2 db'}>
                    {!postStore.editing && (
                        <RichTextPreview
                            hideFade
                            className={'black f6 lh-copy overflow-break-word'}
                        >
                            {postStore.editingContent}
                        </RichTextPreview>
                    )}
                    {postStore.editing && (
                        <>
                            <div className={'mb3 db'}>
                                <Input
                                    autoCorrect={'none'}
                                    allowClear
                                    size={'large'}
                                    defaultValue={postStore.titleContent}
                                    onChange={postStore.setTitleContent}
                                />
                            </div>
                            <Editor
                                onChange={postStore.setEditingContent}
                                value={postStore.editingContent}
                                threadUsers={postStore.threadUsers}
                            />
                            <div className={'flex flex-row justify-end pt2'}>
                                <Button onClick={postStore.toggleEdit} className={'mr2'}>
                                    Cancel
                                </Button>
                                <Button
                                    disabled={postStore.editingContent === ''}
                                    type={'danger'}
                                    onClick={postStore.submitEdit}
                                    loading={postStore.submitEditLoading}
                                >
                                    Save Edit
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {!postStore.editing && (
                    <div className={'mt2 flex flex-row justify-between'}>
                        <div className={'flex flex-row items-center'}>
                            <Button
                                disabled={postStore.editing}
                                size={'small'}
                                type={'primary'}
                                className={'mr1'}
                                onClick={postStore.toggleReply}
                            >
                                <Icons.ReplyIcon />
                                Reply
                            </Button>
                            {isSameUser && (
                                <Button
                                    type={postStore.editing ? 'danger' : 'default'}
                                    size={'small'}
                                    className={'mr1'}
                                    onClick={postStore.toggleEdit}
                                >
                                    <Icon type="edit" theme={'filled'} />
                                    Edit
                                </Button>
                            )}
                            {authStore.hasAccount && (
                                <Button
                                    size={'small'}
                                    title={
                                        userStore.watching.has(id) ? 'Unwatch post' : 'Watch post'
                                    }
                                    className={'mh1'}
                                    onClick={() =>
                                        userStore.toggleThreadWatch(id, {
                                            post: postStore.observableThread.openingPost,
                                        })
                                    }
                                >
                                    <Icon
                                        type={userStore.watching.has(id) ? 'eye' : 'eye-invisible'}
                                        theme={userStore.watching.has(id) ? 'filled' : 'outlined'}
                                        style={{
                                            color: userStore.watching.has(id)
                                                ? '#079e99'
                                                : 'inherit',
                                        }}
                                    />
                                </Button>
                            )}
                            <Button
                                size={'small'}
                                title={'View block'}
                                className={'mh1'}
                                icon={'link'}
                                onClick={() =>
                                    openInNewTab(
                                        `https://bloks.io/transaction/${postStore.observableThread.openingPost.transaction}`
                                    )
                                }
                            />
                            <Popover
                                title={'Share this post'}
                                content={<SharePostPopover url={url} />}
                                placement={'bottom'}
                            >
                                <Button
                                    size={'small'}
                                    title={'Share post'}
                                    className={'mh1'}
                                    icon={'share-alt'}
                                />
                            </Popover>
                        </div>
                        {authStore.hasAccount && <DropdownMenu key="more" />}
                    </div>
                )}
            </div>

            {/*Render Opening Post Reply Box*/}
            {postStore.replying && (
                <div className={'mt3'} id={'reply'}>
                    <Editor
                        disabled={postStore.editing}
                        onChange={postStore.setReplyContent}
                        threadUsers={postStore.threadUsers}
                    />
                    <div className={'flex flex-row justify-end pt2'}>
                        <Button
                            disabled={postStore.replyingContent === '' || !authStore.hasAccount}
                            onClick={postStore.togglePreview}
                            className={'mr2'}
                        >
                            Preview
                        </Button>
                        <Button
                            disabled={postStore.replyingContent === '' || !authStore.hasAccount}
                            type={'primary'}
                            onClick={postStore.submitReply}
                            loading={postStore.submitReplyLoading}
                        >
                            Post Reply
                        </Button>
                    </div>
                </div>
            )}

            {postStore.showPreview && <ReplyingPostPreview content={postStore.replyingContent} />}

            {/*Render Replies*/}
            {postStore.observableThread.openingPost.totalReplies > 0 && (
                <div className={'mt3'} id={'comments'}>
                    <span className={'silver'}>
                        viewing all {postStore.observableThread.openingPost.totalReplies} comments
                    </span>
                    <div className={'mt2 bg-white pv2 card'}>
                        {postStore.observableThread.openingPost.replies.map(reply => (
                            <Replies
                                key={reply.uuid}
                                reply={reply}
                                threadUsers={postStore.threadUsers}
                                highlightedPostUUID={postStore.highlightedPostUUID}
                                setHighlightedPosUUID={postStore.setHighlightedPosUUID}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

const PostPageComponent = observer(PostPageComponentObserverable)

const PostPage: React.FC = () => {
    const { postsStore, authStore }: RootStore = useStores()
    const query: any = useParams()
    const [thread, setThread] = useState(null)
    const [loading, setLoading] = useState(false)
    const [url, setUrl] = useState('')
    const fetchThread = useCallback(() => {
        setLoading(true)
        postsStore
            .getThreadById(query.id, authStore.postPub)
            .then(thread => {
                setThread(thread)
                getThreadUrl(thread.openingPost).then((url: string) => setUrl(url))
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
                setThread(null)
            })
    }, [query.id])

    useEffect(() => {
        fetchThread()
    }, [query.id])

    if (loading) return <Icon type="loading" />

    if (!thread) return <Empty description={'This is not the thread you were looking for...'} />

    return (
        <>
            <Helmet>
                <title>
                    {thread.openingPost.title} - #{thread.openingPost.sub}
                </title>
            </Helmet>
            <PostPageComponent thread={thread} url={url} query={query} />
        </>
    )
}

export default observer(PostPage)
