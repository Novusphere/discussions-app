import React from 'react'
import { NextPage } from 'next'
import { observer, useLocalStore } from 'mobx-react-lite'
import { Thread } from '@novuspherejs'
import { Button, Divider, Icon, Tooltip } from 'antd'
import Link from 'next/link'
import { UserNameWithIcon, Tips, VotingHandles, RichTextPreview, Replies, Icons } from '@components'
import moment from 'moment'
import { NextRouter, withRouter } from 'next/router'
import _ from 'lodash'

interface IPostPageProps {
    router: NextRouter
    thread: Thread
    query: {
        name: string
        id: string
        title: string
    }
}

const PostPage: NextPage<IPostPageProps> = ({ router, thread, query: { name, id, title } }) => {
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
                    _.map(_.filter(postStore.observableThread.map, (posts: any) => posts.pub.length), posts => {
                        let poster = posts.poster

                        if (poster === 'eosforumanon') {
                            poster = posts.displayName
                        }

                        return {
                            id: `${posts.pub}-${posts.uidw}`,
                            value: poster,
                            icon: posts.imageData,
                        }
                    }),
                    option => option.id
                )
            },

            handleVoting: () => {
                postStore.upvotes += 1
            },
        }),
        {
            thread,
        }
    )

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

                <div className={'mt2 flex flex-row items-center'}>
                    <Button>
                        <Icons.ReplyIcon />
                        Reply
                    </Button>
                    <Button
                        title={'Watch post'}
                        className={'ml3 mr2 dim'}
                        icon={'eye-invisible'}
                        type={'link'}
                        style={{
                            color: '#777777',
                        }}
                    />
                    <Button
                        title={'Copy url of this post'}
                        className={'mh2 dim'}
                        icon={'link'}
                        type={'link'}
                        style={{
                            color: '#777777',
                        }}
                    />
                </div>

                {/*Render Opening Post Replies*/}
            </div>

            {/*Render Replies*/}
            <div className={'mt3'}>
                <span className={'silver'}>
                    viewing all {postStore.observableThread.openingPost.totalReplies} comments
                </span>
                <div className={'mt2 bg-white pv2'}>
                    {postStore.observableThread.openingPost.replies.map(reply => (
                        <Replies key={reply.uuid} reply={reply} router={router} threadUsers={postStore.threadUsers} />
                    ))}
                </div>
            </div>
        </>
    )
}

;(PostPage as any).getInitialProps = async function({ store, query, ...rest }: any) {
    const postPub = store.authStore.postPub
    const thread = await store.postsStore.getThreadById(query.id, postPub)

    return {
        thread,
        query: query,
    }
}

export default withRouter(observer(PostPage  as any))
