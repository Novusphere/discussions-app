import React, {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
} from 'react'
import {
    Layout as AntdLayout,
    Icon,
    Skeleton,
    Input,
    Divider,
    Popover,
    Button,
    message,
    notification,
} from 'antd'
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
} from '@components'
import { useObserver } from 'mobx-react-lite'
import cx from 'classnames'
import Link from 'next/link'
import { RootStore, StoreContext } from '@stores'
import { getVersion, isServer } from '@utils'
import { eos } from '@novuspherejs'
import { observer } from 'mobx-react'

const { Search } = Input
const { Header, Footer, Content } = AntdLayout

interface ILayoutProps {}

const Layout: FunctionComponent<ILayoutProps> = ({ children }) => {
    const {
        authStore,
        uiStore,
        settingStore,
        tagStore,
        walletStore,
        userStore,
    }: RootStore = useContext(StoreContext)

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
                <div
                    className={cx([
                        'fl w-30 vh-75 ph2',
                        {
                            dn: uiStore.hideSidebar,
                            db: !uiStore.hideSidebar,
                        },
                    ])}
                >
                    <SidebarTagView />

                    <div className={'bg-white list pv2 card'}>
                        <li className={'ph3 pv1'} key="1">
                            <Link href={'/'} as={'/'}>
                                <a>
                                    <Icon className={'pr2'} type="home" />
                                    Home
                                </a>
                            </Link>
                        </li>
                        <li className={'ph3 pv1'} key="2">
                            <Link href={'/feed'} as={'/feed'}>
                                <a>
                                    <Icon className={'pr2'} type="team" />
                                    Feed
                                </a>
                            </Link>
                        </li>
                        <li className={'ph3 pv1'} key="3">
                            <Link href={'/all'} as={'/all'}>
                                <a>
                                    <Icon className={'pr2'} type="read" />
                                    All
                                </a>
                            </Link>
                        </li>
                        {useObserver(() => {
                            if (tagStore.tagGroup.size) {
                                return (
                                    <>
                                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                                        {[...tagStore.tagGroup.entries()].map(([name, tags]) => {
                                            const _name = name.toLowerCase()
                                            const as = `/tags/${tags.join(',')}`
                                            return (
                                                <li
                                                    className={cx([
                                                        'ph3 pv1',
                                                        // {
                                                        //     dim: router.asPath !== as,
                                                        //     'sidebar-link-active':
                                                        //         router.asPath === as,
                                                        // },
                                                    ])}
                                                    key={_name}
                                                >
                                                    <Link
                                                        href={`/tags/[tags]`}
                                                        as={as}
                                                        shallow={false}
                                                    >
                                                        <a>{name}</a>
                                                    </Link>
                                                </li>
                                            )
                                        })}
                                    </>
                                )
                            }
                        })}
                        <div className={'pa3 db'}>
                            <Input
                                size={'default'}
                                allowClear
                                addonAfter={<Icon type="plus-circle" theme={'filled'} />}
                                placeholder="Add a tag to subscribe"
                                onPressEnter={(e: any) => {
                                    tagStore.addSubscribed(e.target.value)
                                    userStore.syncDataFromLocalToServer()
                                }}
                            />
                        </div>
                        {useObserver(() => (
                            <div className={'mt3 db'}>
                                {[...tagStore.subscribed.toJS()].map(subscribed => {
                                    const tag: any = tagStore.tagModelFromObservables(subscribed)

                                    if (!tag) return null

                                    return (
                                        <li key={subscribed} className={'ph3 pv1 black'}>
                                            <Popover
                                                content={
                                                    <div className={'pa1'}>
                                                        <span
                                                            className={
                                                                'f5 flex flex-row items-center justify-between'
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    'flex flex-row items-center'
                                                                }
                                                            >
                                                                <img
                                                                    className={'dib'}
                                                                    src={tag.logo}
                                                                    alt={`${subscribed} icon`}
                                                                    width={45}
                                                                />
                                                                <span className={'ml3 dib'}>
                                                                    <span className={'b db'}>
                                                                        <Link
                                                                            href={'/tag/[name]'}
                                                                            as={`/tag/${subscribed}`}
                                                                        >
                                                                            <a
                                                                                className={
                                                                                    'f5 black db'
                                                                                }
                                                                            >
                                                                                #{subscribed}
                                                                            </a>
                                                                        </Link>
                                                                    </span>
                                                                    {typeof tag.memberCount !==
                                                                        'undefined' && (
                                                                        <span
                                                                            className={'f6 db gray'}
                                                                        >
                                                                            {tag.memberCount}{' '}
                                                                            members
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </span>
                                                            <Button
                                                                onClick={() => {
                                                                    tagStore.removeSubscribed(
                                                                        subscribed
                                                                    )
                                                                    userStore.syncDataFromLocalToServer()
                                                                }}
                                                                shape="circle"
                                                            >
                                                                <Icon type="delete" />
                                                            </Button>
                                                        </span>
                                                        {tag.tagDescription && (
                                                            <>
                                                                <Divider />
                                                                <span className={'f6'}>
                                                                    {tag.tagDescription}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                }
                                                placement={'right'}
                                                overlayClassName={styles.tagOverlay}
                                            >
                                                <span>
                                                    <Link
                                                        href={`/tag/[name]`}
                                                        as={`/tag/${subscribed}`}
                                                        shallow={false}
                                                    >
                                                        <a className={'dib'}>
                                                            <img
                                                                className={'dib'}
                                                                src={tag.logo}
                                                                alt={`${subscribed} icon`}
                                                                width={25}
                                                            />
                                                            <span className={'dib mh2'}>
                                                                #{subscribed}
                                                            </span>
                                                        </a>
                                                    </Link>
                                                </span>
                                            </Popover>
                                        </li>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>

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
            <div className={cx([styles.footer, 'bg-white pv3 light-silver'])}>
                <div className="tc lh-copy">
                    {useObserver(() => (
                        <p className={'b f6'}>
                            Version: {getVersion()} ({process.env.BUILD_ID})
                        </p>
                    ))}
                    <p>
                        This site is fully{' '}
                        <a href="https://github.com/Novusphere/discussions-app">open source</a>
                        .
                        <br />
                        <br />
                        <a
                            href={
                                'https://docs.google.com/document/d/e/2PACX-1vRSHTH1e3eR1IPumj9H63XAP3_QT0kQOd5v2f_9um_3hPHi1PBJaH-XQhoguSBrXv_YdHd4s1BryVhc/pub'
                            }
                            target={'_blank'}
                        >
                            Privacy Policy
                        </a>
                        <br />
                        <br />
                        The developers of this software take no responsibility for the content
                        displayed.
                        <br />
                        No images, files or media are hosted directly by the forum, please contact
                        the respective site owners hosting content in breach of DMCA
                    </p>
                </div>
            </div>
        </AntdLayout>
    )
}

Layout.defaultProps = {}

export default observer(Layout)
