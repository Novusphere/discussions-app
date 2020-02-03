import React, { FunctionComponent, useState } from 'react'

import styles from './Tips.module.scss'
import dynamic from 'next/dynamic'
import { isServer } from '@utils'
import { CSSTransition } from 'react-transition-group'

interface ITipsProps {
    tips: any
}

const Tips: FunctionComponent<ITipsProps> = ({ tips }) => {
    let images = []

    let walletStore = window.localStorage.getItem('walletStore')

    if (!walletStore || !tips) return null

    if (walletStore) {
        walletStore = JSON.parse(walletStore)
        images = walletStore['supportedTokensImages']
    }

    const [collapse, toggleCollapse] = useState(Object.keys(tips).length > 3)

    const renderCollapsed = () => {
        if (!collapse) return null
        return (
            <object
                onClick={() => toggleCollapse(!collapse)}
                className={'db pointer dim tip'}
                title={'Click to toggle tips'}
            >
                <span className={'tiny gray'}>
                    <span className={'pl2'}>{Object.keys(tips).length}</span>
                </span>
            </object>
        )
    }

    const renderUncollapsed = () => {
        return (
            <CSSTransition timeout={200} classNames={'slide'} unmountOnExit in={!collapse}>
                <div className={'flex flex-wrap'}>
                    {
                        Object.keys(tips).map(symbol => {
                            let tokenImageSymbol = images[symbol]
                            if (!tokenImageSymbol)
                                tokenImageSymbol = ['https://cdn.novusphere.io/static/atmos.svg', 3]
                            const [img, precision] = tokenImageSymbol

                            return (
                                <span
                                    key={symbol}
                                    className={'ph2 flex flex-row items-center'}
                                    title={`${tips[symbol].toFixed(precision)} ${symbol} tipped`}
                                >
                                    <img
                                        src={img}
                                        alt={`${symbol} image`}
                                        className={'dib'}
                                        width={'25px'}
                                    />
                                    <span className={'f6 gray dib pl1 tiny'}>
                                        {' '}
                                        × {tips[symbol].toFixed(precision)}
                                    </span>
                                </span>
                            )
                        }) as any
                    }
                </div>
            </CSSTransition>
        )
    }

    return (
        <div className={'flex flex-wrap'}>
            {renderUncollapsed()}
            {renderCollapsed()}
        </div>
    )
}

Tips.defaultProps = {}

export default dynamic(() => Promise.resolve(Tips), {
    ssr: false,
    loading: () => <span>...</span>,
})
