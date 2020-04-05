import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import cx from 'classnames'
import _ from 'lodash'
import { Icon, Spin } from 'antd'
import {
    UserBalances,
    SettingsAirdrop,
    SettingsConnections,
    SettingsBlocked,
    SettingsModeration,
    SettingsWallet,
    SettingsContent,
} from '@components'
import { Link, useParams } from 'react-router-dom'
import Helmet from 'react-helmet'

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
            <div className={'flex flex-row'}>
                <div className={'w-30 h-100 pv4 bg-white card'}>
                    <div className={'db'}>
                        <span className={'db f6 b black ph4'}>Settings</span>

                        <ul className={'list pa0 ma0 mt3'}>
                            <Link to={'/settings/connections'} className={'gray'}>
                                <li className={className(setting, 'connections')}>Connections</li>
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
        </>
    )
}

export default observer(SettingsPage)
