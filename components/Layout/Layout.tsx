import React, { FunctionComponent, useCallback, useEffect } from 'react'
import { Layout as AntdLayout, Input, message, notification } from 'antd'
import styles from './Layout.module.scss'
import {
    HeaderLoggedOut,
    HeaderLogo,
    HeaderNewPost,
    HeaderNotifications,
    HeaderSearch,
    HeaderUserBar,
    Modals,
    SidebarTagView,
    SidebarLinks,
    Footer,
} from '@components'
import { useObserver } from 'mobx-react-lite'
import cx from 'classnames'
import { RootStore, useStores } from '@stores'
import { getVersion } from '@utils'
import { eos } from '@novuspherejs'

const { Header } = AntdLayout

interface ILayoutProps {}

const Layout: FunctionComponent<ILayoutProps> = ({ children }) => {
    const { authStore, uiStore, settingStore, walletStore }: RootStore = useStores()

    message.config({
        top: 75,
    })

    notification.config({
        top: 75,
    })

    // fire some stuff
    useEffect(() => {
        settingStore.loadSettings()

        eos.initializeTokens().then(() => {
            eos.init({
                host: 'nodes.get-scatter.com',
                port: 443,
                protocol: 'https',
                chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
            })
            walletStore.setTokens(eos.tokens)
            walletStore.getSupportedTokensForUnifiedWallet()
        })

        if (authStore.hasEOSWallet) {
            authStore.connectScatterWallet()
        }
    }, [])

    const logout = useCallback(() => {
        authStore.logOut()
        uiStore.showToast('Success', 'You have logged out!', 'success')
    }, [])

    return (
        <AntdLayout className={'overflow-x-hidden'}>
            <Modals />
            <Header className={cx([styles.header, 'container bb b--light-gray'])}>
                <div className={cx([styles.container, 'center flex flex-row items-center'])}>
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
            </Header>
            <span className={styles.banner}>
                <img
                    src={uiStore.activeBanner}
                    title={'Active banner'}
                    alt={'Active banner image'}
                />
            </span>
            <div className={cx([styles.content, styles.container, 'center flex pv3'])}>
                {useObserver(() => (
                    <div
                        className={cx([
                            'fl w-30 vh-100 ph2',
                            {
                                dn: uiStore.hideSidebar,
                                db: !uiStore.hideSidebar,
                            },
                        ])}
                    >
                        <SidebarTagView />

                        <div className={'bg-white list pv2 card'}>
                            <SidebarLinks />
                        </div>
                    </div>
                ))}

                <div
                    className={cx([
                        'fl ml4',
                        {
                            'w-100': uiStore.hideSidebar,
                            'w-70': !uiStore.hideSidebar,
                        },
                    ])}
                >
                    {children}
                </div>
            </div>
            <footer className={cx([styles.footer, 'bg-white pv3 light-silver'])}>
                <div className="tc lh-copy">
                    <Footer />
                </div>
            </footer>
        </AntdLayout>
    )
}

Layout.defaultProps = {}

export default Layout
