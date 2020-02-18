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
} from '../index'
import { useObserver } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'

interface IHeaderDesktopProps {}

const Header: FunctionComponent<IHeaderDesktopProps> = () => {
    const { authStore, walletStore, uiStore }: RootStore = useStores()

    const logout = useCallback(() => {
        authStore.logOut()
        uiStore.showToast('Success', 'You have logged out!', 'success')
    }, [])

    return (
        <div className={cx([styles.container, 'w-100 flex flex-row items-center'])}>
            <HeaderLogo />
            <HeaderSearch />
            {useObserver(() =>
                authStore.hasAccount ? (
                    <div className={styles.headerIntractable}>
                        <HeaderNotifications />
                        <HeaderNewPost />
                        <HeaderUserBar
                            icon={authStore.postPub}
                            logout={logout}
                            displayName={authStore.displayName}
                            postPub={authStore.postPub}
                            balances={walletStore.balances.toJSON()}
                        />
                    </div>
                ) : (
                    <HeaderLoggedOut />
                )
            )}
        </div>
    )
}

Header.defaultProps = {}

export default Header
