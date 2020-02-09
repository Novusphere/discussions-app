import { RootStore, useStores } from '@stores'
import React, { useCallback } from 'react'
import { useObserver } from 'mobx-react-lite'
import { Avatar, Button, Divider, List, Switch, Typography } from 'antd'
import { getIdenticon } from '@utils'
import Link from 'next/link'

const { Text } = Typography

const Blocked = () => {
    const { userStore, tagStore, settingStore }: RootStore = useStores()

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

    return useObserver(() => (
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
                                            <Link href={`/u/[username]`} as={`/u/${name}-${keys}`}>
                                                <a>{name}</a>
                                            </Link>
                                        </span>

                                        <Text className={'db'} ellipsis>
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
                <List
                    locale={{
                        emptyText: <span>You have no blocked posts</span>,
                    }}
                    itemLayout="horizontal"
                    dataSource={[...userStore.blockedPosts.toJS()]}
                    renderItem={([path, date]) => {
                        const [, tagName] = path.split('/')
                        const tag = tagStore.tagModelFromObservables(tagName)
                        if (!tag) return null
                        return (
                            <List.Item className={'flex flex-row items-center justify-between'}>
                                <>
                                    <span>
                                        <span className={'pr3 dib'}>
                                            <Avatar src={tag.logo} size={'large'} />
                                        </span>
                                        <Link href={'/tag/[name]/[id]/[title]'} as={path}>
                                            {path}
                                        </Link>
                                    </span>
                                    <Button
                                        size={'small'}
                                        type={'danger'}
                                        key={'unblock'}
                                        onClick={() => userStore.toggleBlockPost(path)}
                                    >
                                        unblock
                                    </Button>
                                </>
                            </List.Item>
                        )
                    }}
                />
            </div>
        </>
    ))
}

export default Blocked
