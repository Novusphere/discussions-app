import React, { FunctionComponent } from 'react'

import styles from './TokenSelect.module.scss'
import { Select } from 'antd'
import { RootStore, useStores } from '@stores'
import { observer } from 'mobx-react'

const { Option } = Select

interface ITokenSelectProps {
    handleTokenChange: (token: string) => any
}

const TokenSelect: FunctionComponent<ITokenSelectProps> = ({ handleTokenChange }) => {
    const { walletStore }: RootStore = useStores()
    let walletStoreLS = window.localStorage.getItem('walletStore')
    let images: any = []

    if (walletStoreLS) {
        walletStoreLS = JSON.parse(walletStoreLS)
        images = walletStoreLS['supportedTokensImages']
    }

    return (
        <Select
            size={'large'}
            showSearch
            className={'w-100'}
            placeholder={'Select a token'}
            onChange={handleTokenChange}
        >
            {walletStore.supportedTokensAsSelectable.map(option => {
                return (
                    <Option
                        key={option.value}
                        value={option.value}
                        className={'flex flex-row items-center'}
                    >
                        {images[option.label] && (
                            <img src={images[option.label][0]} className={'mr2 dib'} width={15} />
                        )}
                        {option.label}
                    </Option>
                )
            })}
        </Select>
    )
}

TokenSelect.defaultProps = {}

export default observer(TokenSelect)
