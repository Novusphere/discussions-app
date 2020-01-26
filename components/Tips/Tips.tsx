import * as React from 'react'
import { PostTips } from '@novuspherejs/discussions/post'
import { observer } from 'mobx-react'
import { useState } from 'react'
import { faCoins } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CSSTransition } from 'react-transition-group'

interface ITipProps {
    tips: PostTips | null
    tokenImages: any
}

export default observer(({ tips, tokenImages }: ITipProps) => {
    if (!tips || !tokenImages) return null
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
                    <FontAwesomeIcon icon={faCoins} color={'#AAAAAA'} />
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
                            let tokenImageSymbol = tokenImages[symbol]
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
})
