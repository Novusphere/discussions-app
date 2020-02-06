import { RootStore, useStores } from '@stores'
import { useObserver } from 'mobx-react-lite'
import { Icon } from 'antd'
import React from 'react'

const Connections = () => {
    const { authStore }: RootStore = useStores()

    return (
        <>
            <div className={'flex flex-row items-center justify-between'}>
                <span className={'db'}>
                    <span className={'db b black f6'}>EOS Wallet</span>
                    <span className={'db gray f6'}>
                        You can connect your EOS wallets to Discussions App.
                    </span>
                </span>
                <span
                    className={'db primary pointer'}
                    onClick={() => authStore.connectScatterWallet(authStore.hasEOSWallet)}
                >
                    {useObserver(() => (
                        <>
                            {!authStore.connectScatterWallet['pending'] ? (
                                authStore.hasEOSWallet ? (
                                    '(disconnect)'
                                ) : (
                                    '(connect)'
                                )
                            ) : (
                                <Icon type="loading" />
                            )}
                        </>
                    ))}
                </span>
            </div>
        </>
    )
}

export default Connections
