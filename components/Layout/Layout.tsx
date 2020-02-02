import React, { FunctionComponent, useContext } from 'react'
import { Layout as AntdLayout, ConfigProvider } from 'antd'
import styles from './Layout.module.scss'
import {
    HeaderLoggedOut,
    HeaderLogo,
    HeaderNewPost,
    HeaderNotifications,
    HeaderSearch,
    HeaderUserBar,
} from '@components'
import { RootStoreContext } from '@stores'

const { Header, Footer, Sider, Content } = AntdLayout

interface ILayoutProps {}

const Layout: FunctionComponent<ILayoutProps> = ({ children }) => {
    const store = useContext(RootStoreContext)

    return (
        <ConfigProvider>
            <AntdLayout>
                <Header className={styles.header}>
                    <HeaderLogo />
                    <HeaderSearch />
                    {store.authStore.hasAccount ? (
                        <div className={styles.headerIntractable}>
                            <HeaderNotifications />
                            <HeaderNewPost />
                            <HeaderUserBar />
                        </div>
                    ) : (
                        <HeaderLoggedOut />
                    )}
                </Header>
                <Content className={styles.content}>{children}</Content>
                <Footer className={styles.footer}>Footer</Footer>
            </AntdLayout>
        </ConfigProvider>
    )
}

Layout.defaultProps = {}

export default Layout
