import React, { FunctionComponent, useCallback, useState } from 'react'
import { Avatar, Menu, Dropdown, Icon, Popover, Divider } from 'antd'

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
            link: '/settings/wallets',
        },
    ]

    let walletStore = window.localStorage.getItem('walletStore')
    let images = []

    if (walletStore) {
        walletStore = JSON.parse(walletStore)
        images = walletStore['supportedTokensImages']
    }

    const menu = (
        <ul className={'list ma0 pa0'}>
            {defaults.map((item, index) => (
                <li key={index + 1} onClick={item.onClick} className={'mb2 primary dim pointer'}>
                    {item.link ? (
                        <Link href={item.as} as={item.link}>
                            <a>{item.label}</a>
                        </Link>
                    ) : (
                        item.label
                    )}
                </li>
            ))}

            {Object.keys(balances).length > 0 &&  <Divider />}

            {Object.keys(balances).map(symbol => (
                <li key={symbol} className={'mb2 flex flex-row items-center'}>
                    <img
                        src={images[symbol][0]}
                        alt={`${symbol} image`}
                        className={'dib'}
                        width={'25px'}
                    />
                    <span className={'db ml2'}>
                        {balances[symbol]} {symbol}
                    </span>
                </li>
            ))}
        </ul>
    )

    const content = menu

    return (
        <Popover content={content} style={{ width: 400 }} overlayClassName={styles.userOptions}>
            <a href={'#'} className={styles.userLink}>
                shovel12
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
