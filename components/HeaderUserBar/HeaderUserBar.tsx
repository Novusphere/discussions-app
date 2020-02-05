import React, { FunctionComponent } from 'react'
import { Avatar, Menu, Icon, Dropdown } from 'antd'

import styles from './HeaderUserBar.module.scss'
import { getIdenticon } from '@utils'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { UserBalances } from '@components';

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
                        <Link href={item.as} as={item.link}>
                            <a>
                                <span onClick={item.onClick}>{item.label}</span>
                            </a>
                        </Link>
                    ) : (
                        item.label
                    )}
                </Menu.Item>
            ))}

            {Object.keys(balances).length > 0 && <Menu.Divider />}

            <UserBalances className={'ph2 pb2'} />
        </Menu>
    )

    return (
        <Dropdown overlay={menu}>
            <a href={'#'} className={styles.userLink}>
                {displayName}
                <Icon type="down" style={{ marginLeft: 5 }} />
                <Avatar
                    src={getIdenticon(icon)}
                    size={'default'}
                    icon={'user'}
                    className={styles.avatar}
                />
            </a>
        </Dropdown>
    )
}

HeaderUserBar.defaultProps = {
    icon: null,
}

export default dynamic(() => Promise.resolve(HeaderUserBar), { ssr: false })
