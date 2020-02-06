import React, { useEffect } from 'react'
import { NextPage } from 'next'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import cx from 'classnames'
import dynamic from 'next/dynamic'
import Link from 'next/link'
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

/**
 * Use dynamic to prevent ssr renders
 */
const Setting = dynamic(
    () =>
        Promise.resolve(({ page }: any) => {
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
        }),
    {
        ssr: false,
    }
)

const className = (current, page) =>
    cx([
        'f6 ph4 pv2 pointer dim',
        {
            'bg-near-white': current === page,
        },
    ])

const SettingsPage: NextPage<any> = ({ page }) => {
    const { uiStore, walletStore }: RootStore = useStores()

    useEffect(() => {
        uiStore.setSidebarHidden('true')

        return () => {
            uiStore.setSidebarHidden('false')
        }
    }, [])

    return (
        <div className={'flex flex-row'}>
            <div className={'w-30 vh-75 bg-white card'}>
                <div className={'db'}>
                    <span className={'db f6 b black ph4 pt4'}>Settings</span>

                    <ul className={'list pa0 ma0 mt3'}>
                        <Link
                            href={'/settings/[setting]'}
                            as={'/settings/connections'}
                            replace={true}
                        >
                            <a className={'gray'}>
                                <li className={className(page, 'connections')}>Connections</li>
                            </a>
                        </Link>

                        <Link href={'/settings/[setting]'} as={'/settings/wallet'} replace={true}>
                            <a className={'gray'}>
                                <li className={className(page, 'wallet')}>Wallet </li>
                            </a>
                        </Link>

                        <Link
                            href={'/settings/[setting]'}
                            as={'/settings/moderation'}
                            replace={true}
                        >
                            <a className={'gray'}>
                                <li className={className(page, 'moderation')}>Moderation</li>
                            </a>
                        </Link>

                        <Link href={'/settings/[setting]'} as={'/settings/airdrop'} replace={true}>
                            <a className={'gray'}>
                                <li className={className(page, 'airdrop')}>Airdrop </li>
                            </a>
                        </Link>

                        <Link href={'/settings/[setting]'} as={'/settings/blocked'} replace={true}>
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
                        Balances{' '}
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
                <Setting page={page} />
            </div>
        </div>
    )
}

SettingsPage.getInitialProps = async function({ query }) {
    let page = query.setting as string

    if (['connections', 'wallet', 'moderation', 'airdrop', 'blocked'].indexOf(page) === -1) {
        page = 'connections'
    }

    return {
        page,
    }
}

export default observer(SettingsPage)
