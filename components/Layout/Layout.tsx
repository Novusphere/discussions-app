import React, { FunctionComponent, useEffect, memo } from 'react'
import { Layout as AntdLayout, message, notification } from 'antd'
import styles from './Layout.module.scss'
import {
    Modals,
    SidebarTagView,
    SidebarLinks,
    Footer,
    Header,
    SidebarTrendingTags,
    SidebarDiscoverTags,
    TagViewTabs,
} from '@components'
import { useLocation } from 'react-router-dom'
import { useObserver } from 'mobx-react-lite'
import cx from 'classnames'
import { RootStore, useStores } from '@stores'
import { eos } from '@novuspherejs'
import { refreshOEmbed, Mobile, Desktop } from '@utils'

const { Header: AntdLayoutHeader } = AntdLayout

interface ILayoutProps {}

const Layout: FunctionComponent<ILayoutProps> = ({ children }) => {
    const { authStore, uiStore, settingStore, walletStore }: RootStore = useStores()
    const location = useLocation()

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

    // TODO: Implement a better re-render https://github.com/facebook/react/issues/15156#issuecomment-474590693
    useEffect(() => {
        uiStore.rotateBannerImage()

        let interval: any = null
        let timesRun = 0

        if (location.pathname.search(/(search|tag)/i) !== -1) {
            refreshOEmbed()
            interval = setInterval(() => {
                timesRun += 1
                refreshOEmbed()

                if (timesRun === 5) {
                    clearInterval(interval)
                }
            }, 5000)
        }

        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [location])

    return (
        <AntdLayout
            className={'overflow-x-hidden'}
            style={{
                minHeight: '100vh',
            }}
        >
            <Modals />
            <AntdLayoutHeader className={cx([styles.header, 'bb b--light-gray'])}>
                <Header />
            </AntdLayoutHeader>
            {/*<Alert*/}
            {/*    message={'Alert'}*/}
            {/*    description={'Sign in has been disabled temporarily.'}*/}
            {/*    type={'warning'}*/}
            {/*    showIcon*/}
            {/*/>*/}
            <div className={cx([styles.container, styles.mainContainer, 'center flex pt1 pa0'])}>
                {useObserver(() => (
                    <div
                        className={cx([
                            'fl w-20 h-100 overflow-hidden',
                            {
                                dn: uiStore.hideSidebar,
                                'dn db-ns': !uiStore.hideSidebar,
                            },
                        ])}
                    >
                        <SidebarLinks />
                        <SidebarDiscoverTags />
                    </div>
                ))}

                <div
                    className={cx([
                        'ml2-ns ml0',
                        {
                            'w-100': uiStore.hideSidebar,
                            'w-80-ns w-100': !uiStore.hideSidebar,
                        },
                    ])}
                >
                    {useObserver(() => (
                        <div className={styles.banner}>
                            <img
                                src={uiStore.activeBanner}
                                title={'Active banner'}
                                alt={'Active banner image'}
                            />
                        </div>
                    ))}
                    <SidebarTagView />
                    <TagViewTabs
                        sidebar={
                            <>
                                <SidebarTrendingTags />
                                <Desktop>
                                    <Footer className={'o-60 f6'} footerText={uiStore.footerText} />
                                </Desktop>
                            </>
                        }
                        content={children}
                    />
                </div>
            </div>
            <Mobile>
                <footer className={cx([styles.footer, 'bg-white pv3 light-silver'])}>
                    <Footer
                        className={'tc center lh-copy measure-wide'}
                        footerText={uiStore.footerText}
                    />
                </footer>
            </Mobile>
        </AntdLayout>
    )
}

Layout.defaultProps = {}

export default memo(Layout)
