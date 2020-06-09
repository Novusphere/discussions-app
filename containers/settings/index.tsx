import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import cx from 'classnames'
import _ from 'lodash'
import { Icon, Spin, Menu } from 'antd'
import {
    UserBalances,
    SettingsAirdrop,
    SettingsConnections,
    SettingsBlocked,
    SettingsModeration,
    SettingsWallet,
    SettingsContent,
} from '@components'
import { Link, useParams, useHistory } from 'react-router-dom'
import Helmet from 'react-helmet'
import { Desktop, Mobile } from '@utils'

const Index = ({ setting }: any) => {
    switch (setting) {
        case 'connections':
            return <SettingsConnections />
        case 'wallet':
            return <SettingsWallet />
        case 'blocked':
            return <SettingsBlocked />
        case 'moderation':
            return <SettingsModeration />
        case 'airdrop':
            return <SettingsAirdrop />
        case 'content':
            return <SettingsContent />
        default:
            return null
    }
}

const className = (current: string, page: string) =>
    cx([
        'f6 ph4 pv2 pointer dim',
        {
            'bg-near-white': current === page,
        },
    ])

const SettingsPage: React.FC<any> = () => {
    const { uiStore, walletStore }: RootStore = useStores()
    const { setting } = useParams()
    const history = useHistory()
    const [currentMobileMenuKey, setMobileMenuKey] = useState(setting)

    useEffect(() => {
        uiStore.setSidebarHidden(true)

        return () => {
            uiStore.setSidebarHidden(false)
        }
    }, [])

    return (
        <>
            <Helmet>
                <title>{`Settings - ${setting}`}</title>
            </Helmet>
            <Desktop>
                <div className={'flex flex-row'}>
                    <div className={'w-30 h-100 pv4 bg-white card'}>
                        <div className={'db'}>
                            <span className={'db f6 b black ph4'}>Settings</span>

                            <ul className={'list pa0 ma0 mt3'}>
                                <Link to={'/settings/connections'} className={'gray'}>
                                    <li className={className(setting, 'connections')}>
                                        Connections
                                    </li>
                                </Link>

                                <Link to={'/settings/wallet'} className={'gray'}>
                                    <li className={className(setting, 'wallet')}>Wallet</li>
                                </Link>

                                <Link to={'/settings/moderation'} className={'gray'}>
                                    <li className={className(setting, 'moderation')}>Moderation</li>
                                </Link>

                                <Link to={'/settings/airdrop'} className={'gray'}>
                                    <li className={className(setting, 'airdrop')}>Airdrop</li>
                                </Link>

                                <Link to={'/settings/blocked'} className={'gray'}>
                                    <li className={className(setting, 'blocked')}>Blocked</li>
                                </Link>

                                <Link to={'/settings/content'} className={'gray'}>
                                    <li className={className(setting, 'content')}>Content</li>
                                </Link>
                            </ul>
                        </div>
                        <div className={'db'}>
                            <span
                                className={
                                    'db f6 b black ph4 pt4 flex flex-row justify-between items-center'
                                }
                            >
                                Balances
                                {!walletStore.refreshAllBalances['pending'] ? (
                                    <Icon type="reload" onClick={walletStore.refreshAllBalances} />
                                ) : (
                                    <Spin />
                                )}
                            </span>

                            <UserBalances className={'ph4'} />
                        </div>
                    </div>
                    <div className={'fl ml3 w-70 bg-white card pa4'}>
                        <span className={'f4 b black db mb3'}>{_.startCase(setting)}</span>
                        <Index setting={setting} />
                    </div>
                </div>
            </Desktop>
            <Mobile>
                <div className={'bg-white card pa4 mb1'}>
                    <span
                        className={'db f6 b black pv2 flex flex-row justify-between items-center'}
                    >
                        Balances
                        {!walletStore.refreshAllBalances['pending'] ? (
                            <Icon type="reload" onClick={walletStore.refreshAllBalances} />
                        ) : (
                            <Spin />
                        )}
                    </span>

                    <UserBalances />
                </div>
                <Menu
                    mode={'horizontal'}
                    selectedKeys={[currentMobileMenuKey]}
                    onClick={e => {
                        setMobileMenuKey(e.key)
                        history.replace(`/settings/${e.key}`)
                    }}
                >
                    <Menu.Item key={'connections'}>Connections</Menu.Item>
                    <Menu.Item key={'wallet'}>Wallet</Menu.Item>
                    <Menu.Item key={'moderation'}>Moderation</Menu.Item>
                    <Menu.Item key={'airdrop'}>Airdrop</Menu.Item>
                    <Menu.Item key={'blocked'}>Blocked</Menu.Item>
                    <Menu.Item key={'content'}>Content</Menu.Item>
                </Menu>
                <div className={'bg-white card pa4'}>
                    <Index setting={currentMobileMenuKey} />
                </div>
            </Mobile>
        </>
    )
}

export default observer(SettingsPage)
