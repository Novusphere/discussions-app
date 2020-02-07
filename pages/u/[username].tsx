import React, { useCallback, useEffect, useState } from 'react'
import { NextPage } from 'next'
import { observer, useObserver } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import { Avatar, Typography, Button, Dropdown, Menu, Icon, Select, List } from 'antd'
import { getIdenticon } from '@utils'
import { InfiniteScrollFeed, Icons } from '@components'
import { discussions } from '@novuspherejs'
import dynamic from 'next/dynamic'

const { Paragraph } = Typography
const { Option } = Select

const Moderation = dynamic(
    () =>
        Promise.resolve(
            ({ onModerationChange, defaultValue, options, tagModelFromObservables }: any) =>
                useObserver(() => (
                    <Select
                        mode={'tags'}
                        size={'default'}
                        showSearch
                        className={'w-100'}
                        placeholder={'Select a tag to assign as moderator'}
                        onChange={onModerationChange}
                        defaultValue={defaultValue}
                    >
                        {options.map(option => {
                            const tag = tagModelFromObservables(option.value)
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
                ))
        ),
    {
        ssr: false,
    }
)

const Following = dynamic(
    () => {
        return Promise.resolve(({ data, handleRemoveUser }: any) => {
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
        })
    },
    { ssr: false }
)

const UserPage: NextPage<any> = ({ username, wallet, imageData, count }) => {
    const { uiStore, postsStore, userStore, authStore, tagStore }: RootStore = useStores()
    const [_count, _setCount] = useState(count)

    useEffect(() => {
        uiStore.setSidebarHidden('true')

        return () => {
            uiStore.setSidebarHidden('false')
        }
    }, [])

    const followUser = useCallback(() => {
        userStore.toggleUserFollowing(username, wallet)

        if (userStore.following.has(wallet)) {
            _setCount(_count + 1)
        } else {
            _setCount(_count - 1)
        }
    }, [_count])

    const isSameUser = username == authStore.displayName

    const menu = (
        <Menu>
            <Menu.Item>
                <a
                    className={'flex flex-row items-center'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => userStore.toggleBlockUser(username, wallet)}
                >
                    <Icon
                        type="delete"
                        className={'mr2'}
                        theme="twoTone"
                        twoToneColor={'#E7040F'}
                    />
                    {userStore.blockedUsers.has(wallet) ? 'Unblock' : 'Block'} {username}
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

    const onModerationChange = useCallback((tags: string[]) => {
        return userStore.setModerationFromDropdown(username, wallet, tags)
    }, [])

    return (
        <div className={'flex flex-row'}>
            <div className={'w-30 vh-75 bg-white card pa3'}>
                <div className={'flex flex-row items-center'}>
                    <Avatar icon={'user'} src={imageData} size={96} className={'shadow-1 flex-1'} />
                    <div className={'ml3 db w-100'}>
                        <span className={'db f5 b black'}>{username}</span>
                        <span className={'db f6 light-silver'}>{_count} followers</span>
                        {!isSameUser && (
                            <div className={'mt2 flex flex-row items-center'}>
                                <Button
                                    block
                                    size={'default'}
                                    type={'primary'}
                                    onClick={followUser}
                                >
                                    {userStore.following.has(wallet) ? 'Unfollow' : 'Follow'}
                                </Button>
                                <DropdownMenu key="more" />
                            </div>
                        )}
                    </div>
                </div>

                <div className={'mt4'}>
                    <span className={'moon-gray ttu f6'}>Wallet</span>
                    <Paragraph ellipsis copyable className={'f6 pt2'}>
                        {wallet}
                    </Paragraph>
                </div>

                {isSameUser && (
                    <div className={'mt4'}>
                        <span className={'moon-gray ttu f6'}>Following (Only visible to you)</span>
                        <Following
                            data={[...userStore.following.toJS()]}
                            handleRemoveUser={(pub, user) =>
                                userStore.toggleUserFollowing(user, pub)
                            }
                        />
                    </div>
                )}

                {!isSameUser && (
                    <div className={'mt4'}>
                        <span className={'moon-gray ttu f6 mb2'}>Moderation</span>
                        <Moderation
                            onModerationChange={onModerationChange}
                            defaultValue={userStore.activeModerationForCurrentUser(
                                username,
                                wallet
                            )}
                            options={tagStore.tagsWithoutBaseOptions}
                            tagModelFromObservables={tagStore.tagModelFromObservables}
                        />
                    </div>
                )}
            </div>
            <div className={'fl ml3 w-70'}>
                <InfiniteScrollFeed
                    dataLength={postsStore.postsPosition.items}
                    hasMore={postsStore.postsPosition.cursorId !== 0}
                    next={() => postsStore.getPostsForKeys(wallet, [wallet])}
                    posts={postsStore.posts}
                />
            </div>
        </div>
    )
}

UserPage.getInitialProps = async function({ query, store }: any) {
    const postPub = store.authStore.postPub
    store.postsStore.resetPostsAndPosition()
    const [username, wallet] = query.username.split('-')
    const imageData = getIdenticon(wallet)

    await store.postsStore.getPostsForKeys(postPub, [wallet])
    const { count } = await discussions.getUser(wallet)

    return {
        imageData,
        username,
        wallet,
        count,
    }
}

export default observer(UserPage)
