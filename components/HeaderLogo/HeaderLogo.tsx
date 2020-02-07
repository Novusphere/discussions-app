import React, { FunctionComponent } from 'react'
import styles from './HeaderLogo.module.scss'
import Link from 'next/link'
import cx from 'classnames'

interface IHeaderLogoProps {}

const HeaderLogo: FunctionComponent<IHeaderLogoProps> = () => {
    return (
        <span className={cx(['f4', styles.logo])}>
            <Link href={'/'} as={'/'}>
                <a>Home</a>
            </Link>
        </span>
    )
}

HeaderLogo.defaultProps = {}

export default HeaderLogo
