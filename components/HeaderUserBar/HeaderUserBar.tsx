import React, { FunctionComponent, useState } from 'react'
import { Avatar, Menu, Icon, Dropdown } from 'antd'

import styles from './HeaderUserBar.module.scss'
import { getIdenticon } from '@utils'
import { UserBalances } from '@components'
import { useObserver } from 'mobx-react-lite'
import { Link } from 'react-router-dom'

interface IHeaderUserBarProps {
    icon: string
    logout: () => void
    displayName: string
    postPub: string
    balances: any
}

const HeaderUserBar: FunctionComponent<IHeaderUserBarProps> = ({
    icon,
    logout,
    displayName,
    postPub,
    balances,
}) => {
    const [visible, onVisibleChange] = useState(false)

    const defaults = [
        {
            label: 'Logout',
            onClick: logout,
        },
        {
            label: 'Profile',
            as: '/u/[username]',
            link: `/u/${displayName}-${postPub}`,
        },
        {
            label: 'Settings',
            as: '/settings/[setting]',
            link: '/settings/connections',
        },
        {
            label: 'Connections',
            as: '/settings/[setting]',
            link: '/settings/connections',
        },
        {
            label: 'Wallet',
            as: '/settings/[setting]',
            link: '/settings/wallet',
        },
    ]

    const menu = (
        <Menu>
            {defaults.map((item, index) => (
                <Menu.Item key={index + 1}>
                    {item.link ? (
                        <Link to={item.link}>
                            <a>
                                <span onClick={item.onClick}>{item.label}</span>
                            </a>
                        </Link>
                    ) : (
                        <span onClick={item.onClick}>{item.label}</span>
                    )}
                </Menu.Item>
            ))}

            <Menu.Divider />

            <UserBalances className={'ph2 pb2'} />
        </Menu>
    )

    return (
        <Dropdown overlay={menu} onVisibleChange={onVisibleChange}>
            <a className={styles.userLink}>
                {useObserver(() => (
                    <>
                        {displayName}
                        <Icon
                            type={'caret-down'}
                            style={{ marginLeft: 5 }}
                            rotate={visible ? 180 : 0}
                        />
                        <Avatar
                            src={getIdenticon(icon)}
                            size={'default'}
                            icon={'user'}
                            className={styles.avatar}
                        />
                    </>
                ))}
            </a>
        </Dropdown>
    )
}

HeaderUserBar.defaultProps = {
    icon: null,
}

export default HeaderUserBar
