import React, { FunctionComponent, useCallback, useState } from 'react'
import { Avatar, Menu, Icon, Popover, Divider } from 'antd'

import styles from './HeaderUserBar.module.scss'
import { getIdenticon } from '@utils'
import Link from 'next/link'
import dynamic from 'next/dynamic'

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
    const [visible, setVisible] = useState(false)

    const visibleChange = useCallback(() => {
        setVisible(!visible)
    }, [])

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

    let walletStore = window.localStorage.getItem('walletStore')
    let images = []

    if (walletStore) {
        walletStore = JSON.parse(walletStore)
        images = walletStore['supportedTokensImages']
    }

    const menu = (
        <Menu style={{ borderRight: 0 }}>
            {defaults.map((item, index) => (
                <Menu.Item key={index + 1} style={{ padding: 0 }}>
                    {item.link ? (
                        <Link href={item.as} as={item.link}>
                            <a>
                                <li onClick={item.onClick}>
                                    {item.label}{' '}
                                </li>
                            </a>
                        </Link>
                    ) : (
                        item.label
                    )}
                </Menu.Item>
            ))}

            {Object.keys(balances).length > 0 && <Menu.Divider />}

            {Object.keys(balances).map(symbol => (
                <Menu.Item key={symbol} className={'flex flex-row items-center justify-between'} style={{ display: 'flex', padding: 0 }}>
                    <img
                        src={images[symbol][0]}
                        alt={`${symbol} image`}
                        className={'dib'}
                        width={25}
                    />
                    <span className={'ml3 tr dib'}>
                        {balances[symbol]} {symbol}
                    </span>
                </Menu.Item>
            ))}
        </Menu>
    )

    return (
        <Popover
            content={menu}
            overlayClassName={styles.userOptions}
        >
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
        </Popover>
    )
}

HeaderUserBar.defaultProps = {
    icon: null,
}

export default dynamic(() => Promise.resolve(HeaderUserBar), { ssr: false })
