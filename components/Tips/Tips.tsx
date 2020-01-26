import * as React from 'react'
import { PostTips } from '@novuspherejs/discussions/post'
import { observer } from 'mobx-react'
import { useState } from 'react'

interface ITipProps {
    tips: PostTips | null
    tokenImages: any
}

export default observer(({ tips, tokenImages }: ITipProps) => {
    if (!tips || !tokenImages) return null
    const [collapse, toggleCollapse] = useState(false)

    return (
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
                            <span className={'f6 gray dib pl1'}>
                                {' '}
                                × {tips[symbol].toFixed(precision)}
                            </span>
                        </span>
                    )
                }) as any
            }
        </div>
    )
})
