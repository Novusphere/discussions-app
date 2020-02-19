import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import cx from 'classnames'
import _ from 'lodash'
import { Icon } from 'antd'
import {
    UserBalances,
    SettingsAirdrop,
    SettingsConnections,
    SettingsBlocked,
    SettingsModeration,
    SettingsWallet,
} from '@components'
import { Link } from 'react-router-dom'
import Helmet from 'react-helmet'

/**
 * Use dynamic to prevent ssr renders
 */
const Index = ({ page }: any) => {
    switch (page) {
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

const SettingsPage: React.FC<any> = ({ page }) => {
    const { uiStore, walletStore }: RootStore = useStores()

    useEffect(() => {
        uiStore.setSidebarHidden(true)

        return () => {
            uiStore.setSidebarHidden(false)
        }
    }, [])

    return (
        <>
            <Helmet>
                <title>Discussions App - Settings</title>
            </Helmet>
            <div className={'flex flex-row'}>
                <div className={'w-30 vh-75 bg-white card'}>
                    <div className={'db'}>
                        <span className={'db f6 b black ph4 pt4'}>Settings</span>

                        <ul className={'list pa0 ma0 mt3'}>
                            <Link to={'/settings/connections'}>
                                <a className={'gray'}>
                                    <li className={className(page, 'connections')}>Connections</li>
                                </a>
                            </Link>

                            <Link to={'/settings/wallet'}>
                                <a className={'gray'}>
                                    <li className={className(page, 'wallet')}>Wallet </li>
                                </a>
                            </Link>

                            <Link to={'/settings/moderation'}>
                                <a className={'gray'}>
                                    <li className={className(page, 'moderation')}>Moderation</li>
                                </a>
                            </Link>

                            <Link to={'/settings/airdrop'}>
                                <a className={'gray'}>
                                    <li className={className(page, 'airdrop')}>Airdrop </li>
                                </a>
                            </Link>

                            <Link to={'/settings/blocked'}>
                                <a className={'gray'}>
                                    <li className={className(page, 'blocked')}>Blocked</li>
                                </a>
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
                                <Icon type="loading" />
                            )}
                        </span>

                        <UserBalances className={'ph4'} />
                    </div>
                </div>
                <div className={'fl ml3 w-70 bg-white card pa4'}>
                    <span className={'f4 b black db mb3'}>{_.startCase(page)}</span>
                    <Index page={page} />
                </div>
            </div>
        </>
    )
}

// SettingsPage.getInitialProps = async function({ query }) {
//     let page = query.setting as string
//
//     if (['connections', 'wallet', 'moderation', 'airdrop', 'blocked'].indexOf(page) === -1) {
//         page = 'connections'
//     }
//
//     return {
//         page,
//     }
// }

export default observer(SettingsPage)
