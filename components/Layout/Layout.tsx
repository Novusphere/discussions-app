import React, { FunctionComponent, useEffect } from 'react'
import { Layout as AntdLayout, message, notification } from 'antd'
import styles from './Layout.module.scss'
import {
    Modals,
    SidebarTagView,
    SidebarLinks,
    Footer,
    Header,
    SidebarTrendingTags,
} from '@components'
import { useObserver } from 'mobx-react-lite'
import cx from 'classnames'
import { RootStore, useStores } from '@stores'
import { eos } from '@novuspherejs'

const { Header: AntdLayoutHeader } = AntdLayout

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

    return (
        <AntdLayout className={'overflow-x-hidden'}>
            <Modals />
            <AntdLayoutHeader className={cx([styles.header, 'container bb b--light-gray'])}>
                <Header />
            </AntdLayoutHeader>
            <span className={styles.banner}>
                <img
                    src={uiStore.activeBanner}
                    title={'Active banner'}
                    alt={'Active banner image'}
                />
            </span>
            {/*<Alert*/}
            {/*    message={'Alert'}*/}
            {/*    description={'Sign in has been disabled temporarily.'}*/}
            {/*    type={'warning'}*/}
            {/*    showIcon*/}
            {/*/>*/}
            <div className={cx([styles.content, styles.container, 'center flex pa0 pa3-ns'])}>
                {useObserver(() => (
                    <div
                        className={cx([
                            'fl w-30 vh-100 ph2',
                            {
                                dn: uiStore.hideSidebar,
                                'dn db-ns': !uiStore.hideSidebar,
                            },
                        ])}
                    >
                        <SidebarTagView />
                        <SidebarLinks />
                        <SidebarTrendingTags />
                    </div>
                ))}

                <div
                    className={cx([
                        'fl ml4-ns ml0',
                        {
                            'w-100': uiStore.hideSidebar,
                            'w-70-ns w-100': !uiStore.hideSidebar,
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
