import React, { FunctionComponent, useCallback, useState } from 'react'
import { Avatar, Menu, Dropdown, Icon } from 'antd'

import styles from './HeaderUserBar.module.scss'
import { getIdenticon } from '@utils'

interface IHeaderUserBarProps {
    icon: string
    logout: () => void
}

const HeaderUserBar: FunctionComponent<IHeaderUserBarProps> = ({ icon, logout }) => {
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
        },
        {
            label: 'Settings',
        },
        {
            label: 'Connections',
        },
        {
            label: 'Wallets',
        },
    ]

    const menu = (
        <Menu onClick={visibleChange}>
            {defaults.map((item, index) => (
                <Menu.Item key={index + 1} onClick={item.onClick}>
                    {item.label}
                </Menu.Item>
            ))}
        </Menu>
    )

    return (
        <Dropdown overlay={menu} className={styles.userBar}>
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
        </Dropdown>
    )
}

HeaderUserBar.defaultProps = {
    icon: null,
}

export default HeaderUserBar
