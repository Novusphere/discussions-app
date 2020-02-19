import React, { useCallback, useEffect, useState } from 'react'
import { observer, useObserver } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import { Avatar, Typography, Button, Dropdown, Menu, Icon, Select, List } from 'antd'
import { getIdenticon } from '@utils'
import { InfiniteScrollFeed, Icons } from '@components'
import { discussions } from '@novuspherejs'
import Helmet from 'react-helmet'

const { Paragraph } = Typography
const { Option } = Select

const Moderation = ({ onModerationChange, defaultValue, options, tagModelFromObservables }: any) =>
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
    ))

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

const UserPage: React.FC<any> = ({ username, wallet, imageData, count, postPub }) => {
    const { uiStore, postsStore, userStore, authStore, tagStore }: RootStore = useStores()
    const [_count, _setCount] = useState(count)

    useEffect(() => {
        // replace username with the correct one
        // TODO: Replace username with correct one
        // router.replace('/u/[username]', `/u/${username}-${wallet}`)

        postsStore.resetPostsAndPosition()
        postsStore.getPostsForKeys(postPub, [wallet])

        uiStore.setSidebarHidden(true)

        return () => {
            uiStore.setSidebarHidden(false)
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
        <>
            <Helmet>
                <title>Discussions App - /u/{username}</title>
            </Helmet>
            <div className={'flex flex-row'}>
                <div className={'w-30 vh-75 bg-white card pa3'}>
                    <div className={'flex flex-row items-center'}>
                        <Avatar icon={'user'} src={imageData} size={96} />
                        <div className={'fl ml3'}>
                            <span className={'db f5 b black'}>{username}</span>
                            <span className={'db f6 light-silver'}>{_count} followers</span>
                            {!isSameUser && authStore.hasAccount && (
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
                        <Paragraph ellipsis copyable className={'f6 pt2 w-80'}>
                            {wallet}
                        </Paragraph>
                    </div>

                    {isSameUser && (
                        <div className={'mt4'}>
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
                        next={() => postsStore.getPostsForKeys(postPub, [wallet])}
                        posts={postsStore.posts}
                    />
                </div>
            </div>
        </>
    )
}

// TODO: Replace this with useEffect
// UserPage.getInitialProps = async function({ query, store }: any) {
//     const postPub = store.authStore.postPub
//     const [username, wallet] = query.username.split('-')
//     const imageData = getIdenticon(wallet)
//     const { followers, displayName } = await discussions.getUser(wallet)
//
//     return {
//         imageData,
//         username: displayName,
//         wallet,
//         count: followers,
//         postPub,
//     }
// }

export default observer(UserPage)
