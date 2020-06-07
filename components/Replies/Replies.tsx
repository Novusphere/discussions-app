import React, { FunctionComponent, useCallback, useEffect } from 'react'

import styles from './Replies.module.scss'
import { discussions, Post } from '@novuspherejs'
import {
    Editor,
    Icons,
    ReplyingPostPreview,
    RichTextPreview,
    Tips,
    UserNameWithIcon,
    VotingHandles,
} from '@components'
import moment from 'moment'
import { Button, Dropdown, Icon, Menu, message, Tooltip, Tag } from 'antd'
import { useLocalStore, Observer, useComputed } from 'mobx-react-lite'
import cx from 'classnames'
import { RootStore, useStores } from '@stores'
import {
    createPostObject,
    generateVoteObject,
    openInNewTab,
    signPost,
    transformTipsToTransfers,
    transformTipToMetadata,
    voteAsync,
} from '@utils'
import copy from 'clipboard-copy'
import { MODAL_OPTIONS } from '@globals'
import { useHistory } from 'react-router-dom'
import _ from 'lodash'

interface IRepliesProps {
    preview?: boolean
    setHighlightedPosUUID: (uuid: string) => void
    highlightedPostUUID: string
    threadUsers: any[]
    reply: Post
}

const ButtonGroup = Button.Group

const Replies: FunctionComponent<IRepliesProps> = props => {
    const { userStore, uiStore, authStore, walletStore }: RootStore = useStores()
    const history = useHistory()

    const replyStore = useLocalStore(
        source =>
            ({
                hover: false,
                reply: source.reply,
                myVote: source.reply.myVote,
                downvotes: source.reply.downvotes,
                upvotes: source.reply.upvotes,
                replying: false,
                editing: false,
                collapsed: false,
                blocked: false,
                showPreview: false,
                modPolicy: props.reply.modPolicy,

                get myVoteValue() {
                    if (replyStore.myVote && replyStore.myVote.length) {
                        return replyStore.myVote[0].value
                    }

                    return 0
                },

                get permaLinkURL() {
                    return props.reply.permaLinkURL
                },

                toggleShowPreview: () => {
                    replyStore.showPreview = !replyStore.showPreview
                },

                toggleCollapse: () => {
                    replyStore.collapsed = !replyStore.collapsed
                },

                toggleReply: () => {
                    replyStore.replying = !replyStore.replying
                },

                toggleEditing: () => {
                    replyStore.editing = !replyStore.editing
                },

                setHover: (status: boolean) => {
                    replyStore.hover = status
                },

                handleVoting: async (e: any, uuid: string, value: number) => {
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
                        const myVoteValue = replyStore.myVoteValue

                        // check if your prev vote was positive
                        if (myVoteValue === 1) {
                            // what type of vote are you doing
                            if (type === 'downvote') {
                                replyStore.upvotes -= 1
                                replyStore.downvotes += 1
                                replyStore.myVote = [{ value: -1 }]
                            }

                            if (type === 'upvote') {
                                replyStore.upvotes -= 1
                                replyStore.myVote = [{ value: 0 }]
                            }
                        }

                        // check if your prev vote was negative
                        if (myVoteValue === -1) {
                            // what type of vote are you doing
                            if (type === 'downvote') {
                                replyStore.upvotes += 1
                                replyStore.myVote = [{ value: 0 }]
                            }

                            if (type === 'upvote') {
                                replyStore.upvotes += 1
                                replyStore.downvotes -= 1
                                replyStore.myVote = [{ value: 1 }]
                            }
                        }

                        // you never voted
                        if (myVoteValue === 0) {
                            if (type === 'downvote') {
                                replyStore.downvotes += 1
                                replyStore.myVote = [{ value: -1 }]
                            }
                            //
                            if (type === 'upvote') {
                                replyStore.upvotes += 1
                                replyStore.myVote = [{ value: 1 }]
                            }
                        }

                        const voteObject = generateVoteObject({
                            uuid,
                            postPriv: authStore.postPriv,
                            value: replyStore.myVoteValue,
                        })

                        const data = await voteAsync({
                            voter: '',
                            uuid,
                            value: replyStore.myVoteValue,
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

                /**
                 * Editing
                 */
                submitEditLoading: false,
                editingContent: source.reply.content,

                setEditContent: (content: string) => {
                    replyStore.editingContent = content
                },

                submitEdit: async () => {
                    replyStore.submitEditLoading = true
                    replyStore.reply.content = replyStore.editingContent

                    const postObject = createPostObject({
                        title: '',
                        content: replyStore.editingContent,
                        sub: props.reply.sub,
                        parentUuid: props.reply.uuid,
                        threadUuid: props.reply.threadUuid,
                        uidw: authStore.uidwWalletPubKey,
                        pub: props.reply.pub,
                        posterName: authStore.displayName,
                        postPub: authStore.postPub,
                        postPriv: authStore.postPriv,
                        isEdit: true,
                    })

                    const { sig } = signPost({
                        privKey: authStore.postPriv,
                        uuid: postObject.uuid,
                        content: postObject.content,
                    })

                    postObject.sig = sig

                    try {
                        const { transaction, editedAt } = await discussions.post(postObject as any)
                        replyStore.toggleEditing()
                        replyStore.submitEditLoading = false

                        uiStore.showToast('Success', 'Your edit was submitted!', 'success', {
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

                        replyStore.reply.edit = true
                        replyStore.reply.editedAt = editedAt
                    } catch (error) {
                        replyStore.submitEditLoading = false
                        uiStore.showToast('Failed', 'Your edit failed to submit', 'error')
                    }
                },

                /**
                 * Replying
                 **/
                submitReplyLoading: false,
                replyingContent: '',

                setReplyContent: (content: string) => {
                    replyStore.replyingContent = content
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
                    if (!authStore.hasAccount) {
                        return uiStore.showToast('Failed', 'Please log in to reply', 'error')
                    }

                    try {
                        replyStore.showPreview = false
                        replyStore.submitReplyLoading = true

                        // create a post object
                        const postObject = createPostObject({
                            title: '',
                            content: replyStore.replyingContent,
                            sub: props.reply.sub,
                            parentUuid: props.reply.uuid,
                            threadUuid: props.reply.threadUuid,
                            uidw: authStore.uidwWalletPubKey,
                            pub: props.reply.pub,
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
                                    replyingToUIDW: props.reply.uidw,
                                    replyingToDisplayName: props.reply.displayName,
                                    replyingToPostPub: props.reply.pub,
                                })
                            })

                            authStore.setTEMPTransfers(transferData)
                            replyStore.waitForUserInput(async walletPrivateKey => {
                                if (walletPrivateKey === 'incomplete') {
                                    replyStore.submitReplyLoading = false
                                    uiStore.showToast(
                                        'Failed',
                                        'User cancelled transaction',
                                        'error'
                                    )
                                    return
                                }
                                const _cached = `${walletPrivateKey}`

                                authStore.clearTEMPVariables()
                                uiStore.clearActiveModal()

                                if (!replyStore.reply.tips) {
                                    replyStore.reply.tips = {} as any
                                }

                                postObject.transfers = transformTipsToTransfers({
                                    tips: postObject.transfers,
                                    replyingToUIDW: props.reply.uidw,
                                    replyingToDisplayName: props.reply.displayName,
                                    privateKey: _cached,
                                    tokens: walletStore.supportedTokensForUnifiedWallet,
                                    replyingToPostPub: props.reply.pub,
                                })

                                await replyStore.finishSubmitting(postObject)
                            })
                        } else {
                            await replyStore.finishSubmitting(postObject)
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
                        replyStore.reply.replies.push(postObject)
                        replyStore.submitReplyLoading = false
                        replyStore.setReplyContent('')
                        replyStore.toggleReply()

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

                        replyStore.submitReplyLoading = false
                        uiStore.showToast('Failed', message, 'error')
                        return error
                    }
                },

                toggleModPolicy(policy: string) {
                    let existedBefore = false

                    if (!replyStore.modPolicy.length) {
                        // this post has had no mod policy, so it is an empty array
                        replyStore.modPolicy.push({
                            mod: authStore.postPub,
                            tags: [policy],
                        })
                        existedBefore = false
                    } else {
                        if (replyStore.modPolicy.some(pol => pol.tags.indexOf(policy) !== -1)) {
                            // policy exists, remove it
                            replyStore.modPolicy = _.map(replyStore.modPolicy, pol => {
                                let result = pol

                                if (result.tags.indexOf(policy) !== -1) {
                                    result.tags.splice(result.tags.indexOf(policy), 1)
                                }

                                return result
                            })
                            existedBefore = true
                        } else {
                            // policy doesn't exist, add it
                            replyStore.modPolicy = _.map(replyStore.modPolicy, pol => {
                                let result = pol

                                if (result.tags.indexOf(policy) === -1) {
                                    result.tags.push(policy)
                                }

                                return result
                            })
                            existedBefore = false
                        }
                    }

                    if (existedBefore) {
                        switch (policy) {
                            case 'spam':
                                uiStore.showToast(
                                    'Success',
                                    'This post has been unmarked as spam',
                                    'success'
                                )
                                break
                            case 'pinned':
                                uiStore.showToast(
                                    'Success',
                                    'This post has been unmarked as spam',
                                    'success'
                                )
                                break
                        }
                    } else {
                        switch (policy) {
                            case 'spam':
                                uiStore.showToast('Success', 'This post has been pinned', 'success')
                                break
                            case 'pinned':
                                uiStore.showToast(
                                    'Success',
                                    'This post has been unpinned',
                                    'success'
                                )
                                break
                        }
                    }
                },
            } as any),
        {
            highlightedPostUUID: props.highlightedPostUUID,
            reply: props.reply,
        }
    )

    useEffect(() => {
        replyStore.reply = props.reply
    }, [props.reply])

    const toggleModPolicy = useCallback((e, type) => {
        e.preventDefault()

        replyStore.toggleModPolicy(type)

        console.log('toggled mod policy!', type, replyStore.modPolicy)

        let myPolicy = replyStore.modPolicy.find(p => p.mod === authStore.postPub)

        if (!myPolicy) {
            myPolicy = { mod: authStore.postPub, tags: [] }
        }

        userStore.setModPolicyAsync({
            uuid: replyStore.reply.uuid,
            tags: myPolicy.tags,
        })
    }, [])

    const hasModPolicy = (policy: string) =>
        replyStore.modPolicy.some(pol => pol.tags.indexOf(policy) !== -1)

    const menu = useComputed(() => {
        return (
            <Menu>
                <Menu.Item>
                    <a
                        className={'flex flex-row items-center'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                            userStore.toggleUserFollowing(props.reply.displayName, props.reply.pub)
                        }
                    >
                        <Icon type="user-add" className={'mr2'} />
                        <Observer>
                            {() => (
                                <span>
                                    {userStore.following.has(props.reply.pub)
                                        ? 'Unfollow User'
                                        : 'Follow User'}
                                </span>
                            )}
                        </Observer>
                    </a>
                </Menu.Item>
                <Menu.Item>
                    <a
                        className={'flex flex-row items-center'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => {
                            toggleModPolicy(e, 'spam')
                        }}
                    >
                        <Icon type="stop" className={'mr2'} />
                        <Observer>
                            {() => (
                                <span>{hasModPolicy('spam') ? 'Unblock Post' : 'Block Post'}</span>
                            )}
                        </Observer>
                    </a>
                </Menu.Item>
                {replyStore.reply.depth === 1 && (
                    <Menu.Item>
                        <a
                            className={'flex flex-row items-center'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => {
                                toggleModPolicy(e, 'pinned')
                            }}
                        >
                            <Icon type="pushpin" className={'mr2'} />
                            <Observer>
                                {() => (
                                    <span>
                                        {hasModPolicy('pinned') ? 'Unpin Reply' : 'Pin Reply'}
                                    </span>
                                )}
                            </Observer>
                        </a>
                    </Menu.Item>
                )}
            </Menu>
        )
    }, [userStore.following, userStore.blockedPosts])

    const DropdownMenu = useCallback(() => {
        if (props.reply.pub == authStore.postPub || !authStore.hasAccount) {
            return null
        }

        return (
            <Dropdown key="more" overlay={menu}>
                <Button icon={'ellipsis'} title={'View more options'} />
            </Dropdown>
        )
    }, [props.reply.pub == authStore.postPub, authStore.hasAccount])

    return (
        <Observer>
            {() => (
                <div
                    name={props.reply.uuid}
                    data-post-uuid={props.reply.uuid}
                    className={cx([
                        'w-100',
                        {
                            [styles.pinnedReply]: userStore.pinnedPosts.has(
                                replyStore.permaLinkURL
                            ),
                        },
                    ])}
                    onMouseEnter={() => replyStore.setHover(true)}
                    onMouseLeave={() => replyStore.setHover(false)}
                >
                    <div
                        className={cx(
                            'flex flex-row items-start justify-start bl b--near-white w-100',
                            [
                                {
                                    'bg-washed-yellow':
                                        props.highlightedPostUUID === props.reply.uuid,
                                    [styles.postHover]: replyStore.hover,
                                    [styles.postHoverTransparent]: !replyStore.hover,
                                },
                            ]
                        )}
                    >
                        {
                            <div
                                className={'flex flex-1 pr2 pt1 pl2'}
                                style={{
                                    visibility: replyStore.collapsed ? 'hidden' : 'visible',
                                }}
                            >
                                <VotingHandles
                                    uuid={replyStore.reply.uuid}
                                    myVote={props.preview ? 1 : replyStore.myVoteValue}
                                    upVotes={replyStore.upvotes}
                                    downVotes={replyStore.downvotes}
                                    handler={props.preview ? () => null : replyStore.handleVoting}
                                />
                            </div>
                        }
                        <div className={'tl pt2 w-100 overflow-hidden'}>
                            <div className={'flex flex-row items-center w-100 relative'}>
                                <div className={'flex flex-row items-center'}>
                                    <div className={'pr2'}>
                                        <span
                                            className={'f6 pointer dim silver'}
                                            onClick={replyStore.toggleCollapse}
                                        >
                                            {replyStore.collapsed ? '[+]' : '[-]'}
                                        </span>
                                    </div>
                                    <UserNameWithIcon
                                        name={props.reply.displayName}
                                        imageData={props.reply.imageData}
                                        pub={props.reply.pub}
                                    />
                                    <Tooltip
                                        className={'ph2'}
                                        title={moment(
                                            replyStore.reply.edit
                                                ? replyStore.reply.editedAt
                                                : replyStore.reply.createdAt
                                        ).format('YYYY-MM-DD HH:mm:ss')}
                                    >
                                        <span className={'light-silver f6'}>
                                            {replyStore.reply.edit && 'edited '}{' '}
                                            {moment(
                                                replyStore.reply.edit
                                                    ? replyStore.reply.editedAt
                                                    : replyStore.reply.createdAt
                                            ).fromNow()}
                                        </span>
                                    </Tooltip>
                                    {hasModPolicy('pinned') && <Tag color="cyan">Pinned</Tag>}
                                    {replyStore.collapsed && (
                                        <span className={'light-silver f6 i'}>
                                            ({replyStore.reply.replies.length} children)
                                        </span>
                                    )}
                                </div>
                                <Tips tips={replyStore.reply.tips} />

                                {!props.preview &&
                                    !userStore.blockedPosts.has(replyStore.permaLinkURL) && (
                                        <div
                                            className={cx([
                                                'absolute top-0 right-1',
                                                {
                                                    db: replyStore.hover || replyStore.editing,
                                                    dn: !replyStore.hover,
                                                },
                                            ])}
                                        >
                                            <ButtonGroup size={'small'}>
                                                <Button
                                                    disabled={replyStore.editing}
                                                    title={'Reply to this post'}
                                                    onClick={replyStore.toggleReply}
                                                >
                                                    <Icons.ReplyIcon />
                                                </Button>
                                                <Button
                                                    title={'Copy permalink'}
                                                    onClick={() => {
                                                        copy(
                                                            `${window.location.origin}${replyStore.permaLinkURL}`
                                                        )
                                                        message.success('Copied to your clipboard')
                                                        props.setHighlightedPosUUID(
                                                            props.reply.uuid
                                                        )
                                                        history.replace(replyStore.permaLinkURL)
                                                    }}
                                                >
                                                    <Icons.ShareIcon />
                                                </Button>
                                                <Button
                                                    title={'Open transaction'}
                                                    onClick={() =>
                                                        openInNewTab(
                                                            `https://bloks.io/transaction/${props.reply.transaction}`
                                                        )
                                                    }
                                                >
                                                    <Icons.LinkIcon />
                                                </Button>
                                                <DropdownMenu key="more" />
                                                {props.reply.pub == authStore.postPub && (
                                                    <>
                                                        <Button
                                                            title={'Toggle pin reply'}
                                                            onClick={() =>
                                                                userStore.togglePinPost(
                                                                    replyStore.reply.sub,
                                                                    replyStore.permaLinkURL
                                                                )
                                                            }
                                                        >
                                                            <Icon
                                                                type={'pushpin'}
                                                                theme={'filled'}
                                                            />
                                                        </Button>
                                                        <Button
                                                            type={
                                                                replyStore.editing
                                                                    ? 'danger'
                                                                    : 'default'
                                                            }
                                                            title={'Edit post'}
                                                            onClick={replyStore.toggleEditing}
                                                        >
                                                            <Icon type={'edit'} theme={'filled'} />
                                                        </Button>
                                                    </>
                                                )}
                                            </ButtonGroup>
                                        </div>
                                    )}
                            </div>

                            {hasModPolicy('spam') && (
                                <span className={'f6 moon-gray pv1 i'}>
                                    This post is hidden as it was marked as spam
                                </span>
                            )}

                            {/*Render Content*/}
                            {!replyStore.collapsed &&
                                !hasModPolicy('spam') &&
                                !replyStore.editing && (
                                    <RichTextPreview
                                        hideFade
                                        className={'lh-copy pt2 mr3 dark-gray'}
                                    >
                                        {props.preview
                                            ? props.reply.content
                                            : replyStore.reply.content}
                                    </RichTextPreview>
                                )}

                            {replyStore.editing && (
                                <div className={'pa2'}>
                                    <Editor
                                        onChange={replyStore.setEditContent}
                                        value={replyStore.editingContent}
                                        threadUsers={props.threadUsers}
                                    />
                                    <div className={'flex flex-row justify-end pt2'}>
                                        <Button
                                            onClick={replyStore.toggleEditing}
                                            className={'mr2'}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={replyStore.editingContent === ''}
                                            type={'danger'}
                                            onClick={replyStore.submitEdit}
                                            loading={replyStore.submitEditLoading}
                                        >
                                            Save Edit
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {!props.preview && replyStore.replying ? (
                                <div className={'mr3 mb3'}>
                                    <Editor
                                        onChange={replyStore.setReplyContent}
                                        threadUsers={props.threadUsers}
                                    />
                                    <div className={'flex flex-row justify-end pt2'}>
                                        <Button
                                            onClick={replyStore.toggleShowPreview}
                                            disabled={replyStore.replyingContent === ''}
                                            className={'mr2'}
                                        >
                                            Preview
                                        </Button>
                                        <Button
                                            disabled={replyStore.replyingContent === ''}
                                            type={'primary'}
                                            onClick={replyStore.submitReply}
                                            loading={replyStore.submitReplyLoading}
                                        >
                                            Post Reply
                                        </Button>
                                    </div>
                                </div>
                            ) : null}

                            {replyStore.showPreview && (
                                <ReplyingPostPreview
                                    className={'mr3 mb3'}
                                    content={replyStore.replyingContent}
                                />
                            )}
                        </div>
                    </div>

                    {/*Render Replies*/}
                    {!props.preview &&
                        !replyStore.collapsed &&
                        replyStore.reply.replies.map(child => (
                            <div
                                key={child.uuid}
                                className={'w-100 pl4'}
                                onMouseEnter={() => replyStore.setHover(false)}
                                onMouseLeave={() => replyStore.setHover(true)}
                            >
                                <Replies
                                    reply={child}
                                    threadUsers={props.threadUsers}
                                    highlightedPostUUID={props.highlightedPostUUID}
                                    setHighlightedPosUUID={props.setHighlightedPosUUID}
                                />
                            </div>
                        ))}
                </div>
            )}
        </Observer>
    )
}

Replies.defaultProps = {
    preview: false,
}

export default Replies
