import React, { FunctionComponent, useMemo, useState } from 'react'

import styles from './Tips.module.scss'
import { Badge } from 'antd'
import { CSSTransition } from 'react-transition-group'
import { Desktop, Mobile } from '@utils'

interface ITipsProps {
    tips: any
}

const Tips: FunctionComponent<ITipsProps> = ({ tips }) => {
    let images = []

    let walletStore = useMemo(() => window.localStorage.getItem('walletStore'), [])

    if (walletStore) {
        walletStore = JSON.parse(walletStore)
        images = walletStore['supportedTokensImages']
    }

    const tipKeys = useMemo(() => {
        if (tips) {
            return Object.keys(tips)
        }
        return []
    }, [])

    const [collapse, toggleCollapse] = useState(tipKeys.length > 3)

    if (!tips || !tipKeys.length) {
        return null
    }

    const renderCollapsed = () => {
        if (!collapse) return null
        return (
            <object
                onClick={() => toggleCollapse(!collapse)}
                className={'db pointer dim tip'}
                title={'Click to toggle tips'}
            >
                <span className={'tiny gray'}>
                    <span className={'pl2'}>{tipKeys.length}</span>
                </span>
            </object>
        )
    }

    const renderTip = (symbol, { imgProps = {}, spanProps = {} } = {}) => {
        let tokenImageSymbol = images[symbol]
        if (!tokenImageSymbol) tokenImageSymbol = ['https://cdn.novusphere.io/static/atmos.svg', 3]
        const [img, precision] = tokenImageSymbol
        const count = `${tips[symbol].toFixed(precision)}`
        return (
            <span
                key={symbol}
                className={'ph2 flex flex-row items-center'}
                title={`${tips[symbol].toFixed(precision)} ${symbol} tipped`}
                {...spanProps}
            >
                {img && (
                    <img
                        src={img}
                        alt={`${symbol} image`}
                        className={'dib'}
                        width={'25px'}
                        {...imgProps}
                    />
                )}
                <Desktop>
                    <Badge
                        count={`× ${count}`}
                        style={{
                            backgroundColor: '#fff',
                            color: '#999',
                            boxShadow: '0 0 0 1px #fff inset',
                        }}
                    />
                </Desktop>
            </span>
        )
    }

    const renderUncollapsed = () => {
        return (
            <CSSTransition timeout={200} classNames={'slide'} unmountOnExit in={!collapse}>
                <div className={'flex flex-wrap'}>
                    {
                        tipKeys.map(symbol => {
                            return renderTip(symbol)
                        }) as any
                    }
                </div>
            </CSSTransition>
        )
    }

    return (
        <>
            <Desktop>
                <div className={'flex flex-wrap'}>
                    {renderUncollapsed()}
                    {renderCollapsed()}
                </div>
            </Desktop>
            <Mobile>
                {
                    tipKeys.map(symbol => {
                        return renderTip(symbol, {
                            imgProps: { width: '20px' },
                            spanProps: { className: 'pr1 dib' },
                        })
                    }) as any
                }
            </Mobile>
        </>
    )
}

Tips.defaultProps = {}

export default Tips
