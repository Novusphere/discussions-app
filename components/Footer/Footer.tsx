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
        </div>
    )
}

Footer.defaultProps = {}

export default Footer
