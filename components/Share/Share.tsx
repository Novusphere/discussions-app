import * as React from 'react'
import copy from 'clipboard-copy'
import { tweetCurrentPage } from '@utils'

interface IShareProps {
    url: string
}

const Share: React.FC<IShareProps> = ({ url }) => (
    <div className={'card mw5 gray pa3 tl'}>
        <span
            className={'pr3 f6 link dim pointer'}
            title={'Copy URL to clipboard'}
            onClick={() => copy(`${window.location.origin}${url}`)}
        >
            permalink
        </span>

        <span
            className={'pr3 f6 link dim pointer'}
            onClick={tweetCurrentPage}
            title={'Share to Twitter'}
        >
            twitter
        </span>
    </div>
)

export default Share
