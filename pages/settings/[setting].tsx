import React, { useCallback, useEffect, useState } from 'react'
import { NextPage } from 'next'
import { observer } from 'mobx-react-lite'
import { RootStore, useStores } from '@stores'
import cx from 'classnames'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import _ from 'lodash'

const Setting = dynamic(
    () =>
        Promise.resolve(({ page }: any) => {
            switch (page) {
                case 'connections':
                    return (
                        <>
                            Hey
                        </>
                    )
                default:
                    return <span>Hey</span>
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
    const { uiStore, postsStore, userStore, authStore, tagStore }: RootStore = useStores()

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
                        <li className={className(page, 'connections')}>
                            <Link href={'/settings/[settings]'} as={'/settings/connections'} shallow={true}>
                                <a className={'gray'}>Connections</a>
                            </Link>
                        </li>
                        <li className={className(page, 'wallet')}>
                            <Link href={'/settings/[settings]'} as={'/settings/wallet'} shallow={true}>
                                <a className={'gray'}>Wallet</a>
                            </Link>
                        </li>
                        <li className={className(page, 'moderation')}>
                            <Link href={'/settings/[settings]'} as={'/settings/moderation'} shallow={true}>
                                <a className={'gray'}>Moderation</a>
                            </Link>
                        </li>
                        <li className={className(page, 'airdrop')}>
                            <Link href={'/settings/[settings]'} as={'/settings/airdrop'} shallow={true}>
                                <a className={'gray'}>Airdrop</a>
                            </Link>
                        </li>
                        <li className={className(page, 'blocked')}>
                            <Link href={'/settings/[settings]'} as={'/settings/blocked'} shallow={true}>
                                <a className={'gray'}>Blocked</a>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className={'fl ml3 w-70 bg-white card pa4'}>
                <span className={'f4 b black db'}>{_.startCase(page)}</span>
                <Setting page={page} />
            </div>
        </div>
    )
}

SettingsPage.getInitialProps = async function({ query }) {
    const page = query.setting
    return {
        page,
    }
}

export default observer(SettingsPage)
