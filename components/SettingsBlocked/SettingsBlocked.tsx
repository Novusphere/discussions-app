import { RootStore, useStores } from '@stores'
import React, { useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Avatar, Button, Divider, List, Spin, Switch, Typography } from 'antd'
import { getIdenticon, getThreadUrl } from '@utils'
import { Link } from 'react-router-dom'
import { Post } from '@novuspherejs'
import _ from 'lodash'

const { Text } = Typography

const Blocked = () => {
    const { userStore, tagStore, authStore, postsStore }: RootStore = useStores()

    const handleHiddenOnChange = useCallback(val => {
        if (val) {
            userStore.setBlockedContent('hidden')
        } else {
            userStore.setBlockedContent('collapsed')
        }
    }, [])

    const handleCollapsedOnChange = useCallback(val => {
        if (val) {
            userStore.setBlockedContent('collapsed')
        } else {
            userStore.setBlockedContent('hidden')
        }
    }, [])

    const handleNSFWOnChange = useCallback(val => {
        userStore.setNSFWContent(val)
    }, [])

    const [blockedPosts, setBlockedPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        postsStore
            .fetchSpamPostsByMod({
                mods: [authStore.postPub],
            })
            .then(posts => {
                setBlockedPosts(posts)
                setLoading(false)
            })
    }, [])

    if (!authStore.hasAccount) {
        return <span className={'f6 gray'}>Please sign in to view this option</span>
    }

    const unblockPost = useCallback(
        (post: Post) => {
            setBlockedPosts(
                _.reject(blockedPosts, ({ post: blockedPost }) => blockedPost.uuid === post.uuid)
            )
            userStore.setModPolicyAsync({
                uuid: post.uuid,
                tags: _.reject(post.tags, tag => tag === 'spam'),
            })
        },
        [blockedPosts]
    )

    return (
        <>
            <span className={'f6 gray'}>
                Here you can set how you wish to view blocked content.
            </span>
            <div className={'mt4'}>
                <div className={'flex flex-row items-center justify-between mb4'}>
                    <span className={'f6'}>
                        <span className={'b db'}>Hidden</span>
                        <span className={'db silver'}>
                            Hide blocked content entirely including all replies.
                        </span>
                    </span>
                    <Switch
                        checked={userStore.blockedContentSetting === 'hidden'}
                        onChange={handleHiddenOnChange}
                    />
                </div>
                <div className={'flex flex-row items-center justify-between mb4'}>
                    <span className={'f6'}>
                        <span className={'b db'}>Collapse</span>
                        <span className={'db silver'}>
                            Auto-Collapse all blocked content, with the ability to expand the post.
                        </span>
                    </span>
                    <Switch
                        checked={userStore.blockedContentSetting === 'collapsed'}
                        onChange={handleCollapsedOnChange}
                    />
                </div>
                <div className={'flex flex-row items-center justify-between mb4'}>
                    <span className={'f6'}>
                        <span className={'b db'}>Hide Unsigned Posts</span>
                        <span className={'db silver'}>
                            If a post has no signature, hide it with the above settings.
                        </span>
                    </span>
                    <Switch
                        checked={userStore.unsignedPostsIsSpam}
                        onChange={userStore.toggleUnsignedPostsIsSpam}
                    />
                </div>
                <div className={'flex flex-row items-center justify-between mb4'}>
                    <span className={'f6'}>
                        <span className={'b db'}>Blur NSFW Content</span>
                        <span className={'db silver'}>
                            If a post has been marked NSFW, this will blur the content.
                        </span>
                    </span>
                    <Switch checked={userStore.nsfwContentSetting} onChange={handleNSFWOnChange} />
                </div>
            </div>
            <Divider />
            <div className={'mt4'}>
                <span className={'f4 b black db mb3'}>Users</span>
                <List
                    locale={{
                        emptyText: <span>You have no blocked users</span>,
                    }}
                    itemLayout="horizontal"
                    dataSource={[...userStore.blockedUsers.toJS()]}
                    renderItem={([keys, name]) => (
                        <List.Item className={'flex flex-row items-center justify-between'}>
                            <>
                                <span className={'flex flex-row items-center'}>
                                    <span className={'pr3 dib'}>
                                        <Avatar src={getIdenticon(keys)} size={'large'} />
                                    </span>
                                    <span className={'dib'}>
                                        <span className={'db'}>
                                            <Link to={`/u/${name}-${keys}`}>{name}</Link>
                                        </span>

                                        <Text
                                            className={'db'}
                                            ellipsis
                                            style={{ maxWidth: '20vw' }}
                                        >
                                            {keys}
                                        </Text>
                                    </span>
                                </span>
                                <Button
                                    size={'small'}
                                    type={'danger'}
                                    key={'unblock'}
                                    onClick={() => userStore.toggleBlockUser(name, keys)}
                                >
                                    unblock
                                </Button>
                            </>
                        </List.Item>
                    )}
                />
            </div>
            <div className={'mt4'}>
                <span className={'f4 b black db mb3'}>Posts</span>
                {loading && <Spin />}
                {!loading && (
                    <List
                        locale={{
                            emptyText: <span>You have no blocked posts</span>,
                        }}
                        itemLayout="horizontal"
                        dataSource={blockedPosts}
                        renderItem={({ post }: { post: Post }) => {
                            const tag = tagStore.tagModelFromObservables(post.tags[0])
                            if (!tag) return null
                            const path = getThreadUrl(post, post.title ? '' : post.uuid) as string
                            return (
                                <List.Item className={'flex flex-row items-center justify-between'}>
                                    <>
                                        <span className={'flex flex-row items-center'}>
                                            <span className={'pr3'}>
                                                <Avatar src={tag.logo} size={'large'} />
                                            </span>
                                            <Link to={path}>
                                                <Text ellipsis style={{ maxWidth: '20vw' }}>
                                                    {path}
                                                </Text>
                                            </Link>
                                        </span>
                                        <Button
                                            size={'small'}
                                            type={'danger'}
                                            key={'unblock'}
                                            onClick={() => unblockPost(post)}
                                        >
                                            unblock
                                        </Button>
                                    </>
                                </List.Item>
                            )
                        }}
                    />
                )}
            </div>
        </>
    )
}

export default observer(Blocked)
