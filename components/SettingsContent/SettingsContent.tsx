import { RootStore, useStores } from '@stores'
import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, Button, Spin, List, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { getThreadTitle } from '@utils'
import { useObserver } from 'mobx-react-lite'
import { discussions } from '@novuspherejs'

const { Text } = Typography

const WatchedThreads = () => {
    const { userStore, tagStore }: RootStore = useStores()
    const [threads, setThreads] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const threadIds: string[] = [...userStore.watching.keys()]
        populateThreads()
        async function populateThreads() {
            setLoading(true)
            await threadIds.map(async id => {
                const thread = await discussions.getThread(id)
                thread['shortId'] = id
                setThreads(prevState => [...prevState, thread])
            })
            setLoading(false)
        }
    }, [])

    const unwatchThread = useCallback(
        (id: string, index: number) => {
            userStore.watching.delete(id)
            setThreads(prevState => prevState.filter((value, i) => i !== index))
        },
        [threads]
    )

    if (loading) {
        return <Spin />
    }

    return (
        <List
            locale={{
                emptyText: <span>You have no watched threads</span>,
            }}
            itemLayout="horizontal"
            dataSource={threads}
            renderItem={(thread, index) => {
                const tag = tagStore.tagModelFromObservables(thread.openingPost.sub)
                if (!tag) return null
                const id = thread['shortId']
                const title = getThreadTitle(thread.openingPost)
                const path = `/tag/${thread.openingPost.sub}/${id}/${title}`
                return (
                    <List.Item className={'flex flex-row items-center justify-between'}>
                        <>
                            <span className={'flex flex-row items-center'}>
                                <span className={'pr3'}>
                                    <Avatar src={tag.logo} size={'large'} />
                                </span>
                                <Link to={path}>
                                    <Text ellipsis style={{ maxWidth: '20vw' }}>
                                        <span className={'db b'}>{thread.openingPost.title}</span>
                                    </Text>
                                </Link>
                            </span>
                            <Button
                                size={'small'}
                                key={'unblock'}
                                onClick={() => unwatchThread(id, index)}
                            >
                                unwatch
                            </Button>
                        </>
                    </List.Item>
                )
            }}
        />
    )
}

const PinnedThreads = () => {
    const { userStore, tagStore }: RootStore = useStores()

    return (
        <List
            locale={{
                emptyText: <span>You have no pinned threads</span>,
            }}
            itemLayout="horizontal"
            dataSource={[...userStore.pinnedPosts.toJS()]}
            renderItem={([path]) => {
                const [, tagName] = path.split('/')
                const tag = tagStore.tagModelFromObservables(tagName)
                if (!tag) return null
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
                                key={'unpin'}
                                onClick={() => userStore.togglePinPost(tagName, path)}
                            >
                                unpin
                            </Button>
                        </>
                    </List.Item>
                )
            }}
        />
    )
}

const SettingsContent = () => {
    const { userStore }: RootStore = useStores()
    const clearWatchedThreads = useCallback(() => {
        userStore.watching.clear()
        userStore.syncDataFromLocalToServer()
    }, [])

    return (
        <>
            <span className={'f6 gray'}>
                Here you can see what content you have taken action on
            </span>

            <div className={'mt4'}>
                <span className={'flex flex-row items-center justify-between'}>
                    <span className={'f4 b black db mb3'}>Watched Threads</span>
                    <Button
                        type={'danger'}
                        size={'small'}
                        key={'unblock'}
                        disabled={!userStore.watching.size}
                        onClick={clearWatchedThreads}
                    >
                        unwatch all
                    </Button>
                </span>
                {useObserver(() => {
                    if (!userStore.watching.size) {
                        return <span className={'f6 gray'}>You have no watched threads</span>
                    }

                    return <WatchedThreads />
                })}
            </div>

            <div className={'mt4'}>
                <span className={'flex flex-row items-center justify-between'}>
                    <span className={'f4 b black db mb3'}>Pinned Threads</span>
                </span>
                {useObserver(() => {
                    if (!userStore.pinnedPosts.size) {
                        return <span className={'f6 gray'}>You have no pinned threads</span>
                    }

                    return <PinnedThreads />
                })}
            </div>
        </>
    )
}

export default SettingsContent
