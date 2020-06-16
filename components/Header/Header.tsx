import React, { FunctionComponent, useCallback } from 'react'

import styles from './Header.module.scss'
import cx from 'classnames'
import {
    HeaderLoggedOut,
    HeaderLogo,
    HeaderNewPost,
    HeaderNotifications,
    HeaderSearch,
    HeaderUserBar,
} from '@components'
import { useObserver, Observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import { Mobile, Desktop } from '@utils'
import { Menu } from 'antd'

interface IHeaderDesktopProps {}

const Header: FunctionComponent<IHeaderDesktopProps> = () => {
    const { authStore, walletStore, uiStore }: RootStore = useStores()

    const logout = useCallback(() => {
        authStore.logOut()
        uiStore.showToast('Success', 'You have logged out!', 'success')
    }, [])

    const renderHeaderUserBar = () => (
        <HeaderUserBar
            icon={authStore.postPub}
            logout={logout}
            displayName={authStore.displayName}
            postPub={authStore.postPub}
            balances={walletStore.balances.toJSON()}
        />
    )

    return (
        <div className={cx([styles.container, 'center flex flex-row items-center'])}>
            <Desktop>
                <HeaderLogo />
                <HeaderSearch />
                <Observer>
                    {() => {
                        if (authStore.hasAccount) {
                            return (
                                <div className={styles.headerIntractable}>
                                    <HeaderNotifications />
                                    <HeaderNewPost />
                                    {renderHeaderUserBar()}
                                </div>
                            )
                        }

                        return <HeaderLoggedOut />
                    }}
                </Observer>
            </Desktop>
            <Mobile>
                <div className={'w-100 ph2 flex flex-row items-center justify-between'}>
                    <HeaderLogo />
                    <Observer>
                        {() => {
                            if (authStore.hasAccount) {
                                return (
                                    <div className={'flex flex-row items-center'}>
                                        <HeaderNotifications />
                                        <HeaderNewPost />
                                        {renderHeaderUserBar()}
                                    </div>
                                )
                            }
                            return (
                                <div className={'w-100 flex flex-row items-center justify-end'}>
                                    <HeaderLoggedOut />
                                </div>
                            )
                        }}
                    </Observer>
                </div>
            </Mobile>
        </div>
    )
}

Header.defaultProps = {}

export default Header
