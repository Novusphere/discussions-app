import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import { Avatar, Typography, Button, Dropdown, Menu, Icon, Select, List, Spin } from 'antd'
import { Desktop, getIdenticon, sleep } from '@utils'
import { InfiniteScrollFeed, Icons } from '@components'
import { discussions } from '@novuspherejs'
import Helmet from 'react-helmet'
import { useParams } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import cx from 'classnames'

const { Paragraph } = Typography
const { Option } = Select

const Moderation = ({
    onModerationChange,
    defaultValue,
    options,
    tagModelFromObservables,
}: any) => {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        sleep(1500).then(() => {
            setLoading(false)
        })
    }, [])

    if (loading) {
        return <Spin className={'db'} />
    }

    return (
        <Select
            mode={'tags'}
            size={'default'}
            showSearch
            className={'w-100'}
            placeholder={'Select a tag to assign as moderator'}
            onChange={onModerationChange}
            defaultValue={defaultValue}
        >
            {options.map((option: any) => {
                const tag = tagModelFromObservables(option.value)
                if (!tag) return null
                return (
                    <Option key={option.value} value={option.value}>
                        <img
                            src={tag.logo}
                            title={`${tag.name} icon`}
                            className={'mr2 dib'}
                            width={15}
                        />
                        {option.label}
                    </Option>
                )
            })}
        </Select>
    )
}

const Following = ({ data, handleRemoveUser }: any) => {
    if (data && data.length) {
        return (
            <List
                dataSource={data}
                renderItem={([pub, username]) => {
                    return (
                        <List.Item
                            actions={[
                                <Icon
                                    onClick={() => handleRemoveUser(pub, username)}
                                    className={'dim pointer'}
                                    type="delete"
                                    theme={'filled'}
                                    style={{ color: '#FF4136' }}
                                />,
                            ]}
                        >
                            {username}
                        </List.Item>
                    )
                }}
            />
        )
    }

    return <span className={'f6 light-silver db pt2'}>You are not following anyone</span>
}

const UserPage: React.FC<any> = () => {
    const { uiStore, postsStore, userStore, authStore, tagStore }: RootStore = useStores()
    const [followers, setFollowers] = useState(0)
    const params: { username?: string } = useParams()
    const [username, setUsername] = useState('')
    const [wallet, setWallet] = useState('')
    const [usersPostPub, setPostPub] = useState('')
    const [imageData, setImageData] = useState('')
    const myPostPub = useMemo(() => authStore.postPub, [])
    const isMobile = useMediaQuery({ maxWidth: 767 })

    useEffect(() => {
        uiStore.setSidebarHidden(true)
        const username = params.username

        if (username) {
            const [name, postPub] = username.split('-')
            setImageData(getIdenticon(postPub))

            discussions.getUser(postPub).then(({ followers, displayName, uidw, pub }) => {
                setUsername(displayName)
                setFollowers(followers)
                setWallet(uidw)
                setPostPub(pub)

                postsStore.resetPostsAndPosition()
                postsStore.getPostsForKeys(myPostPub, [postPub])
            })
        }
        return () => {
            uiStore.setSidebarHidden(false)
        }
    }, [myPostPub])

    const followUser = useCallback(() => {
        userStore.toggleUserFollowing(username, usersPostPub)

        if (userStore.following.has(usersPostPub)) {
            setFollowers(followers + 1)
        } else {
            setFollowers(followers - 1)
        }
    }, [followers, usersPostPub, username])

    const isSameUser = useMemo(() => username == authStore.displayName, [username])

    const menu = (
        <Menu>
            <Menu.Item>
                <a
                    className={'flex flex-row items-center'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => userStore.toggleBlockUser(username, usersPostPub)}
                >
                    <Icon
                        type="delete"
                        className={'mr2'}
                        theme="twoTone"
                        twoToneColor={'#E7040F'}
                    />
                    {userStore.blockedUsers.has(usersPostPub) ? 'Unblock' : 'Block'} {username}
                </a>
            </Menu.Item>
        </Menu>
    )

    const DropdownMenu = () => {
        return (
            <Dropdown key="more" overlay={menu}>
                <Button size={'default'} title={'View more options'} className={'ml3'}>
                    <Icons.VerticalEllipsisIcon />
                </Button>
            </Dropdown>
        )
    }

    const onModerationChange = useCallback(
        (tags: string[]) => {
            userStore.setModerationFromDropdown(username, usersPostPub, tags)
            userStore.updateFromActiveDelegatedMembers()
        },
        [usersPostPub, username, wallet]
    )

    if (postsStore.getPostsForKeys['pending']) {
        return <Spin />
    }

    return (
        <>
            <Helmet>
                <title>{`/u/${username}`}</title>
            </Helmet>
            <div
                className={cx([
                    'flex',
                    {
                        'flex-column': isMobile,
                        'flex-row': !isMobile,
                    },
                ])}
            >
                <div
                    className={cx([
                        'bg-white card pa3',
                        {
                            'w-30 vh-75': !isMobile,
                            'w-100 mb3': isMobile,
                        },
                    ])}
                >
                    <div
                        className={cx([
                            'flex items-center',
                            {
                                'flex-column': isMobile,
                                'flex-row': !isMobile,
                            },
                        ])}
                    >
                        <Avatar icon={'user'} src={imageData} size={96} />
                        <div
                            className={cx([
                                'fl ml3',
                                {
                                    'tc pv2': isMobile,
                                    tl: !isMobile,
                                },
                            ])}
                        >
                            <span className={'db f5 b black'}>{username}</span>
                            <span className={'db f6 light-silver'}>{followers} followers</span>
                            {!isSameUser && authStore.hasAccount && (
                                <div className={'mt2 flex flex-row items-center'}>
                                    <Button
                                        block
                                        size={'default'}
                                        type={'primary'}
                                        onClick={followUser}
                                    >
                                        {userStore.following.has(usersPostPub)
                                            ? 'Unfollow'
                                            : 'Follow'}
                                    </Button>
                                    <DropdownMenu key="more" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div
                        className={cx([
                            'mt4',
                            {
                                'w-80': !isMobile,
                                'w-100': isMobile,
                            },
                        ])}
                    >
                        <span className={'moon-gray ttu f6'}>Wallet</span>
                        <Paragraph ellipsis copyable className={'f6 pt2'}>
                            {wallet}
                        </Paragraph>
                    </div>

                    {isSameUser && (
                        <div
                            className={cx([
                                'mt4',
                                {
                                    'w-80': !isMobile,
                                    'w-100': isMobile,
                                },
                            ])}
                        >
                            <span className={'moon-gray ttu f6'}>
                                Following Users (Only visible to you)
                            </span>
                            <Following
                                data={[...userStore.following.toJS()]}
                                handleRemoveUser={(pub: string, user: string) =>
                                    userStore.toggleUserFollowing(user, pub)
                                }
                            />
                        </div>
                    )}

                    {/*{isSameUser && (*/}
                    {/*    <div className={'mt4'}>*/}
                    {/*        <span className={'moon-gray ttu f6'}>*/}
                    {/*            Watching Posts (Only visible to you)*/}
                    {/*        </span>*/}
                    {/*        <Following*/}
                    {/*            data={[...userStore.watching.toJS()]}*/}
                    {/*            handleRemoveUser={(pub, user) =>*/}
                    {/*                userStore.toggleThreadWatch(user, pub)*/}
                    {/*            }*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {!isSameUser && authStore.hasAccount && (
                        <div className={'mt4'}>
                            <span className={'moon-gray ttu f6 mb2'}>Moderation</span>
                            <Moderation
                                onModerationChange={onModerationChange}
                                defaultValue={userStore.activeModerationForCurrentUser(
                                    username,
                                    usersPostPub
                                )}
                                options={tagStore.tagsWithoutBaseOptions}
                                tagModelFromObservables={tagStore.tagModelFromObservables}
                            />
                        </div>
                    )}
                </div>
                <div
                    className={cx([
                        'fl ml3',
                        {
                            'w-100': isMobile,
                            'w-70': !isMobile,
                        },
                    ])}
                >
                    <InfiniteScrollFeed
                        dataLength={postsStore.postsPosition.items}
                        hasMore={postsStore.postsPosition.cursorId !== 0}
                        next={() => postsStore.getPostsForKeys(myPostPub, [usersPostPub])}
                        posts={postsStore.posts}
                    />
                </div>
            </div>
        </>
    )
}

export default observer(UserPage)
