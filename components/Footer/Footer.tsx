import React, { FunctionComponent } from 'react'

import styles from './Footer.module.scss'
import { useObserver } from 'mobx-react-lite'
import { getVersion } from '@utils'
import dynamic from 'next/dynamic'

interface IFooterProps {}

const Footer: FunctionComponent<IFooterProps> = () => {
    return (
        <>
            {useObserver(() => (
                <p className={'b f6'}>
                    Version: {getVersion()} ({(window as any).__NEXT_DATA__.buildId})
                </p>
            ))}
            <p>
                This site is fully{' '}
                <a href="https://github.com/Novusphere/discussions-app">open source</a>
                .
                <br />
                <br />
                <a
                    href={
                        'https://docs.google.com/document/d/e/2PACX-1vRSHTH1e3eR1IPumj9H63XAP3_QT0kQOd5v2f_9um_3hPHi1PBJaH-XQhoguSBrXv_YdHd4s1BryVhc/pub'
                    }
                    target={'_blank'}
                >
                    Privacy Policy
                </a>
                <br />
                <br />
                The developers of this software take no responsibility for the content displayed.
                <br />
                No images, files or media are hosted directly by the forum, please contact the
                respective site owners hosting content in breach of DMCA
            </p>
        </>
    )
}

Footer.defaultProps = {}

export default dynamic(() => Promise.resolve(Footer), {
    ssr: false,
})
