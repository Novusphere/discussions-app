import React, { FunctionComponent, useContext } from 'react'
import { Layout as AntdLayout, Icon, ConfigProvider, Menu } from 'antd'
import styles from './Layout.module.scss'
import {
    HeaderLoggedOut,
    HeaderLogo,
    HeaderNewPost,
    HeaderNotifications,
    HeaderSearch,
    HeaderUserBar,
    Modals,
} from '@components'
import { RootStoreContext } from '@stores'
import { useObserver } from 'mobx-react-lite'
import cx from 'classnames'
import Link from 'next/link'

const { Header, Footer, Content } = AntdLayout

interface ILayoutProps {}

const Layout: FunctionComponent<ILayoutProps> = ({ children }) => {
    const store = useContext(RootStoreContext)

    return (
        <ConfigProvider>
            <AntdLayout>
                <Modals />
                <Header className={cx([styles.header, 'container bb b--light-gray'])}>
                    <div className={cx([styles.container, 'center flex flex-row items-center'])}>
                        <HeaderLogo />
                        <HeaderSearch />
                        {useObserver(() =>
                            store.authStore.hasAccount ? (
                                <div className={styles.headerIntractable}>
                                    <HeaderNotifications />
                                    <HeaderNewPost />
                                    <HeaderUserBar icon={store.authStore.postPub} />
                                </div>
                            ) : (
                                <HeaderLoggedOut />
                            )
                        )}
                    </div>
                </Header>
                <span className={styles.banner}>
                    <img
                        src={store.uiStore.activeBanner}
                        title={'Active banner'}
                        alt={'Active banner image'}
                    />
                </span>
                <div className={cx([styles.content, styles.container, 'center flex pv3'])}>
                    <div className={'fl w-30'}>
                        <Menu mode={'vertical'} defaultSelectedKeys={['1']}>
                            <Menu.Item key="1">
                                <Link href={'/'} as={'/'}>
                                    <a>
                                        <Icon type="home" />
                                        Home
                                    </a>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="2">
                                <Link href={'/feed'} as={'/feed'}>
                                    <a>
                                        <Icon type="team" />
                                        Feed
                                    </a>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="3">
                                <Icon type="read" />
                                All
                            </Menu.Item>
                        </Menu>
                    </div>
                    <div className={'fl w-70 ml4'}>{children}</div>
                </div>
                <Footer className={styles.footer}>Footer</Footer>
            </AntdLayout>
        </ConfigProvider>
    )
}

Layout.defaultProps = {}

export default Layout
