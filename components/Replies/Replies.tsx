import React, { FunctionComponent } from 'react'

import styles from './Replies.module.scss'
import { discussions, Post } from '@novuspherejs'
import { Editor, Icons, RichTextPreview, Tips, UserNameWithIcon, VotingHandles } from '@components'
import moment from 'moment'
import { Button, Dropdown, Icon, Menu, message, Tooltip } from 'antd'
import { observer, useLocalStore, useObserver } from 'mobx-react-lite'
import cx from 'classnames'
import { RootStore, useStores } from '@stores'
import {
    createPostObject,
    getPermaLink,
    openInNewTab,
    signPost,
    transformTipsToTransfers,
} from '@utils'
import { NextRouter } from 'next/router'
import copy from 'clipboard-copy'
import { task } from 'mobx-task'
import { MODAL_OPTIONS } from '@globals'

interface IRepliesProps {
    threadUsers: any[]
    router: NextRouter
    reply: Post
}

const ButtonGroup = Button.Group

const Replies: FunctionComponent<IRepliesProps> = props => {
    const { userStore, uiStore, authStore, walletStore }: RootStore = useStores()

    const replyStore = useLocalStore(
        source =>
            ({
                hover: false,
                reply: source.reply,
                myVote: source.reply.myVote,
                downvotes: source.reply.downvotes,
                upvotes: source.reply.upvotes,
                replying: false,
                collapsed: false,
                blocked: false,

                get myVoteValue() {
                    if (replyStore.myVote && replyStore.myVote.length) {
                        return replyStore.myVote[0].value
                    }

                    return 0
                },

                get permaLinkURL() {
                    return getPermaLink(props.router.asPath.split('#')[0], props.reply.uuid)
                },

                toggleCollapse: () => {
                    replyStore.collapsed = !replyStore.collapsed
                },

                toggleReply: () => {
                    replyStore.replying = !replyStore.replying
                },

                setHover: status => {
                    replyStore.hover = status
                },

                handleVoting: async () => {
                    console.log('test')
                    replyStore.reply.upvotes += 1
                },

                /**
                 * Replying
                 **/
                submitReplyLoading: false,
                replyingContent: '',

                setReplyContent: content => {
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
                    }, 100)
                },

                submitReply: task(async () => {
                    try {
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
                                authStore.setTEMPPrivateKey('')
                                uiStore.clearActiveModal()

                                if (!replyStore.reply.tips) {
                                    replyStore.reply.tips = {}
                                }

                                postObject.transfers = transformTipsToTransfers(
                                    postObject.transfers,
                                    props.reply.uidw,
                                    _cached,
                                    walletStore.supportedTokensForUnifiedWallet
                                )

                                await replyStore.finishSubmitting(postObject)
                            })
                        } else {
                            await replyStore.finishSubmitting(postObject)
                        }
                    } catch (error) {
                        throw error
                    }
                }),

                finishSubmitting: async postObject => {
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
                                        openInNewTab(`https://eosq.app/tx/${transaction}`)
                                    }
                                >
                                    View transaction
                                </Button>
                            ),
                        })
                    } catch (error) {
                        replyStore.submitReplyLoading = false
                        uiStore.showToast('Failed', 'Your reply failed to submit', 'error')
                        throw error
                    }
                },
            } as any),
        {
            reply: props.reply,
        }
    )

    const isSameUser = props.reply.pub == authStore.postPub
    const isSpamPost = userStore.blockedPosts.has(replyStore.permaLinkURL)

    const menu = (
        <Menu>
            <Menu.Item>
                <a
                    className={'flex flex-row items-center'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                        userStore.toggleUserFollowing(props.reply.displayName, props.reply.pub)
                    }
                    // style={{
                    //     color: userStore.following.has(props.reply.pub) ? '#079e99' : 'normal',
                    // }}
                >
                    <Icon type="user-add" className={'mr2'} />
                    {useObserver(() =>
                        userStore.following.has(props.reply.pub) ? 'Unfollow User' : 'Follow User'
                    )}
                </a>
            </Menu.Item>
            <Menu.Item>
                <a
                    className={'flex flex-row items-center'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => userStore.toggleBlockPost(replyStore.permaLinkURL)}
                    // style={{
                    //     color: userStore.following.has(props.reply.pub) ? '#FF4136' : 'normal',
                    // }}
                >
                    <Icon type="stop" className={'mr2'} />
                    {useObserver(() =>
                        userStore.blockedPosts.has(replyStore.permaLinkURL)
                            ? 'Unblock Post'
                            : 'Block Post'
                    )}
                </a>
            </Menu.Item>
        </Menu>
    )

    const DropdownMenu = () => {
        return (
            <Dropdown key="more" overlay={menu}>
                <Button icon={'ellipsis'} title={'View more options'} />
            </Dropdown>
        )
    }

    return useObserver(() => (
        <div
            data-post-uuid={props.reply.uuid}
            className={cx(['w-100'])}
            onMouseEnter={() => replyStore.setHover(true)}
            onMouseLeave={() => replyStore.setHover(false)}
        >
            <div
                className={cx('flex flex-row items-start justify-start bl b--near-white w-100', [
                    {
                        [styles.postHover]: replyStore.hover,
                        [styles.postHoverTransparent]: !replyStore.hover,
                    },
                ])}
            >
                <div
                    className={'flex flex-1 pr2 pt1 pl2'}
                    style={{
                        visibility: replyStore.collapsed ? 'hidden' : 'visible',
                    }}
                >
                    <VotingHandles
                        uuid={replyStore.reply.uuid}
                        myVote={replyStore.myVoteValue}
                        upVotes={replyStore.reply.upvotes}
                        downVotes={replyStore.reply.downvotes}
                        handler={replyStore.handleVoting}
                    />
                </div>
                <div className={'tl pt2 w-100'}>
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
                            {replyStore.collapsed && (
                                <span className={'light-silver f6 i'}>
                                    ({replyStore.reply.replies.length} children)
                                </span>
                            )}
                        </div>
                        <Tips tips={replyStore.reply.tips} />

                        {!isSpamPost && (
                            <div
                                className={'absolute top-0 right-1'}
                                style={{
                                    display: !replyStore.hover ? 'none' : 'block',
                                }}
                            >
                                <ButtonGroup size={'small'}>
                                    <Button
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
                                        }}
                                    >
                                        <Icons.ShareIcon />
                                    </Button>
                                    <Button
                                        title={'Open transaction'}
                                        onClick={() =>
                                            openInNewTab(
                                                `https://eosq.app/tx/${props.reply.transaction}`
                                            )
                                        }
                                    >
                                        <Icons.LinkIcon />
                                    </Button>
                                    {!isSameUser && <DropdownMenu key="more" />}
                                    {isSameUser && (
                                        <Button title={'Edit post'}>
                                            <Icon type={'edit'} theme={'filled'} />
                                        </Button>
                                    )}
                                </ButtonGroup>
                            </div>
                        )}
                    </div>

                    {isSpamPost && (
                        <span className={'f6 moon-gray pv1 i'}>
                            This post is hidden as it was marked as spam
                        </span>
                    )}

                    {/*Render Content*/}
                    {!replyStore.collapsed && !isSpamPost && (
                        <RichTextPreview hideFade className={'lh-copy pt2 dark-gray'}>
                            {replyStore.reply.content}
                        </RichTextPreview>
                    )}

                    {replyStore.replying ? (
                        <div className={'mr3 mb3'}>
                            <Editor
                                onChange={replyStore.setReplyContent}
                                threadUsers={props.threadUsers}
                            />
                            <div className={'flex flex-row justify-end pt2'}>
                                <Button
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
                </div>
            </div>

            {/*Render Replies*/}
            {!replyStore.collapsed &&
                replyStore.reply.replies.map(child => (
                    <div
                        key={child.uuid}
                        className={'w-100 pl4'}
                        onMouseEnter={() => replyStore.setHover(false)}
                        onMouseLeave={() => replyStore.setHover(true)}
                    >
                        <Replies
                            reply={child}
                            router={props.router}
                            threadUsers={props.threadUsers}
                        />
                    </div>
                ))}
        </div>
    ))
}

Replies.defaultProps = {}

export default observer(Replies)
