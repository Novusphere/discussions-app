import * as React from 'react'
import { PostTips } from '@novuspherejs/discussions/post'

interface ITipProps {
    tips: PostTips | null
    tokenImages: any
}

export default ({ tips, tokenImages }: ITipProps)=> {
    if (!tips || !tokenImages) return null

    return Object.keys(tips).map(symbol => {
        const tokenImageSymbol = tokenImages[symbol]

        if (!tokenImageSymbol) return null

        const [img, precision] = tokenImageSymbol

        return (
            <span key={symbol} className={'ph2 flex flex-row items-center'}>
                <img src={img} alt={`${symbol} image`} className={'dib'} width={'25px'} />
                <span className={'f6 gray dib'}> x {tips[symbol].toFixed(precision)}</span>
            </span>
        )
    }) as any
}
