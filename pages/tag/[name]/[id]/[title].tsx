import React from 'react'
import { NextPage } from 'next'
import { observer, useLocalStore, useObserver } from 'mobx-react-lite'
import { Thread } from '@novuspherejs'
import { Button, Divider, Dropdown, Icon, Menu, Popover, Tooltip, Result } from 'antd'
import Link from 'next/link'
import {
    UserNameWithIcon,
    Tips,
    VotingHandles,
    RichTextPreview,
    Replies,
    Icons,
    SharePostPopover,
} from '@components'
import moment from 'moment'
import { NextRouter, withRouter } from 'next/router'
import _ from 'lodash'
import { generateVoteObject, getThreadUrl, openInNewTab, voteAsync } from '@utils'
import { RootStore, useStores } from '@stores'

interface IPostPageProps {
    router: NextRouter
    thread: Thread
    url: string
    query: {
        name: string
        id: string
        title: string
    }
}

const PostPage: NextPage<IPostPageProps> = ({
    router,
    thread,
    url,
    query: { name, id, title },
}) => {
    const { userStore, settingStore, authStore, uiStore }: RootStore = useStores()

    const postStore = useLocalStore(
        source => ({
            observableThread: source.thread,
            myVote: source.thread.openingPost.myVote,
            downvotes: source.thread.openingPost.downvotes,
            upvotes: source.thread.openingPost.upvotes,

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
                <Button size={'small'} icon={'ellipsis'} title={'View more options'} />
            </Dropdown>
        )
    }

    const shouldBeHidden =
        userStore.blockedPosts.has(url) && settingStore.blockedContentSetting === 'hidden'

    if (shouldBeHidden) {
        return (
            <Result
                icon={<Icon type="exclamation-circle" theme={'twoTone'} twoToneColor={'#FF4136'} />}
                title={'This post is blocked!'}
                subTitle={
                    'You or a moderator marked this post as spam. You can unblock this post in your settings.'
                }
                extra={[
                    <Link
                        key={'returnBack'}
                        href={`/tag/[name]`}
                        as={`/tag/${thread.openingPost.sub}`}
                        shallow={false}
                        passHref
                    >
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

    return (
        <>
            <Link
                href={`/tag/[name]`}
                as={`/tag/${thread.openingPost.sub}`}
                shallow={false}
                passHref
            >
                <Button title={`See all posts in ${name}`} icon={'caret-left'} type={'primary'}>
                    #{name}
                </Button>
            </Link>

            <div className={'bg-white mv2 pa4'}>
                <div className={'flex flex-row items-center justify-between'}>
                    <div className={'flex flex-row items-center'}>
                        <Link href={`/tag/[name]`} as={`/tag/${thread.openingPost.sub}`}>
                            <a>
                                <span className={'b'}>{thread.openingPost.sub}</span>
                            </a>
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
                                thread.openingPost.edit
                                    ? thread.openingPost.editedAt
                                    : thread.openingPost.createdAt
                            ).format('YYYY-MM-DD HH:mm:ss')}
                        >
                            <span className={'light-silver f6'}>
                                {thread.openingPost.edit && 'edited '}{' '}
                                {moment(
                                    thread.openingPost.edit
                                        ? thread.openingPost.editedAt
                                        : thread.openingPost.createdAt
                                ).fromNow()}
                            </span>
                        </Tooltip>
                    </div>
                    <Tips tips={thread.openingPost.tips} />
                </div>

                <div className={'mv3 flex flex-row justify-between'}>
                    <span className={'black b f4 flex-wrap'}>{thread.openingPost.title}</span>
                    <VotingHandles
                        uuid={thread.openingPost.uuid}
                        myVote={postStore.myVoteValue}
                        upVotes={postStore.upvotes}
                        downVotes={postStore.downvotes}
                        handler={postStore.handleVoting}
                    />
                </div>

                <div className={'mt2 db'}>
                    <RichTextPreview hideFade className={'black f6 lh-copy overflow-break-word'}>
                        {postStore.observableThread.openingPost.content}
                    </RichTextPreview>
                </div>

                <div className={'mt2 flex flex-row justify-between'}>
                    <div className={'flex flex-row items-center'}>
                        <Button size={'small'} className={'mr1'}>
                            <Icons.ReplyIcon />
                            Reply
                        </Button>
                        <Button
                            size={'small'}
                            title={'Watch post'}
                            className={'mh1'}
                            onClick={() =>
                                userStore.toggleThreadWatch(
                                    id,
                                    postStore.observableThread.openingPost.totalReplies
                                )
                            }
                        >
                            <Icon
                                type="eye-invisible"
                                theme={userStore.watching.has(id) ? 'filled' : 'outlined'}
                                style={{
                                    color: userStore.watching.has(id) ? '#079e99' : 'inherit',
                                }}
                            />
                        </Button>
                        <Button
                            size={'small'}
                            title={'View block'}
                            className={'mh1'}
                            icon={'link'}
                            onClick={() =>
                                openInNewTab(
                                    `https://eosq.app/tx/${postStore.observableThread.openingPost.transaction}`
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
                                onClick={() =>
                                    openInNewTab(
                                        `https://eosq.app/tx/${postStore.observableThread.openingPost.transaction}`
                                    )
                                }
                            />
                        </Popover>
                    </div>
                    <DropdownMenu key="more" />
                </div>

                {/*Render Opening Post Reply Box*/}
            </div>

            {/*Render Replies*/}
            <div className={'mt3'}>
                <span className={'silver'}>
                    viewing all {postStore.observableThread.openingPost.totalReplies} comments
                </span>
                <div className={'mt2 bg-white pv2'}>
                    {postStore.observableThread.openingPost.replies.map(reply => (
                        <Replies
                            key={reply.uuid}
                            reply={reply}
                            router={router}
                            threadUsers={postStore.threadUsers}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}
;(PostPage as any).getInitialProps = async function({ store, query, ...rest }: any) {
    const postPub = store.authStore.postPub
    const thread = await store.postsStore.getThreadById(query.id, postPub)
    const url = await getThreadUrl(thread.openingPost)

    return {
        url,
        thread,
        query: query,
    }
}

export default withRouter(observer(PostPage as any))
