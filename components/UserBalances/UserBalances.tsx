import React, { FunctionComponent } from 'react'

import styles from './UserBalances.module.scss'
import dynamic from 'next/dynamic'
import { RootStore, useStores } from '@stores'
import { observer } from 'mobx-react'

interface IUserBalancesProps {
    className?: string
}

const UserBalances: FunctionComponent<IUserBalancesProps> = ({ className }) => {
    const { walletStore }: RootStore = useStores()

    let walletStoreLS = window.localStorage.getItem('walletStore')
    let images = []

    if (walletStoreLS) {
        walletStoreLS = JSON.parse(walletStoreLS)
        images = walletStoreLS['supportedTokensImages']
    }

    const balances = walletStore.balances.toJSON()

    if (!balances || !Object.keys(balances).length) {
        return null
    }

    return (
        <div className={className}>
            {Object.keys(balances).map(symbol => (
                <span
                    key={symbol}
                    className={'flex flex-row items-center justify-between mt3'}
                    style={{ display: 'flex' }}
                >
                    <img
                        src={images[symbol][0]}
                        alt={`${symbol} image`}
                        className={'dib'}
                        width={25}
                    />
                    <span className={'ml3 tr dib'}>
                        {balances[symbol]} {symbol}
                    </span>
                </span>
            ))}
        </div>
    )
}

UserBalances.defaultProps = {}

export default dynamic(() => Promise.resolve(observer(UserBalances)), {
    ssr: false,
})
