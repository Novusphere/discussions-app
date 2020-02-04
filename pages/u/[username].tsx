import React, { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import { Avatar, Typography, Button, Dropdown, Menu, Icon, Select } from 'antd'
import { getIdenticon } from '@utils'
import { InfiniteScrollFeed, Icons } from '@components'
import { discussions } from '@novuspherejs'

const { Paragraph } = Typography
const { Option } = Select

const UserPage: NextPage<any> = ({ username, wallet, imageData, count }) => {
    const { uiStore, postsStore, userStore, authStore }: RootStore = useStores()
    const [_count, _setCount] = useState(count)

    useEffect(() => {
        uiStore.setSidebarHidden('true')

        return () => {
            uiStore.setSidebarHidden('false')
        }
    }, [])

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

    return (
        <div className={'flex flex-row'}>
            <div className={'w-30 vh-75 bg-white card pa3'}>
                <div className={'flex flex-row items-center'}>
                    <Avatar icon={'user'} src={imageData} size={96} className={'shadow-1 flex-1'} />
                    <div className={'ml3 db w-100'}>
                        <span className={'db f5 b black'}>{username}</span>
                        <span className={'db f6 light-silver'}>{_count} followers</span>
                        <div className={'mt2 flex flex-row items-center'}>
                            <Button block size={'default'} type={'primary'}>
                                Follow
                            </Button>
                            <DropdownMenu key="more" />
                        </div>
                    </div>
                </div>

                <div className={'mt4'}>
                    <span className={'moon-gray ttu f6'}>Wallet</span>
                    <Paragraph ellipsis copyable className={'f6'}>
                        {wallet}
                    </Paragraph>
                </div>

                {isSameUser && (
                    <div className={'mt4'}>
                        <span className={'moon-gray ttu f6'}>Following</span>
                        <Paragraph ellipsis copyable className={'f6'}>
                            {wallet}
                        </Paragraph>
                    </div>
                )}

                {!isSameUser && (
                    <div className={'mt4'}>
                        <Select
                            className={'w-100'}
                            placeholder="Select a option and change input text above"
                            onChange={val => console.log(val)}
                        >
                            <Option value="male">male</Option>
                            <Option value="female">female</Option>
                        </Select>
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
    store.postsStore.resetPostsAndPosition()
    const [username, wallet] = query.username.split('-')
    const imageData = getIdenticon(wallet)

    await store.postsStore.getPostsForKeys(wallet, [wallet])
    const { count } = await discussions.getUser(wallet)

    return {
        imageData,
        username,
        wallet,
        count,
    }
}

export default observer(UserPage)
