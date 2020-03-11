import React, { FunctionComponent } from 'react'

import styles from './Footer.module.scss'
import { useObserver } from 'mobx-react-lite'
import { getVersion } from '@utils'
import Markdown from 'markdown-to-jsx'
import cx from 'classnames'

interface IFooterProps {
    className?: string
    footerText: string
}

const Footer: FunctionComponent<IFooterProps> = ({ footerText, className }) => {
    return (
        <div className={cx(className)}>
            {useObserver(() => (
                <p className={'b f6'}>Version {getVersion()}</p>
            ))}
            <Markdown>{footerText}</Markdown>
            {/*<p>*/}
            {/*    This site is fully{' '}*/}
            {/*    <a href="https://github.com/Novusphere/discussions-app">open source</a>*/}
            {/*    .*/}
            {/*    <br />*/}
            {/*    <br />*/}
            {/*    <a*/}
            {/*        href={*/}
            {/*            'https://docs.google.com/document/d/e/2PACX-1vRSHTH1e3eR1IPumj9H63XAP3_QT0kQOd5v2f_9um_3hPHi1PBJaH-XQhoguSBrXv_YdHd4s1BryVhc/pub'*/}
            {/*        }*/}
            {/*        target={'_blank'}*/}
            {/*    >*/}
            {/*        Privacy Policy*/}
            {/*    </a>*/}
            {/*    <br />*/}
            {/*    <br />*/}
            {/*    The developers of this software take no responsibility for the content displayed.*/}
            {/*    <br />*/}
            {/*    No images, files or media are hosted directly by the forum, please contact the*/}
            {/*    respective site owners hosting content in breach of DMCA*/}
            {/*</p>*/}
        </div>
    )
}

Footer.defaultProps = {}

export default Footer
