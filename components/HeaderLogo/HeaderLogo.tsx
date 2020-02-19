import React, { FunctionComponent } from 'react'
import styles from './HeaderLogo.module.scss'
import cx from 'classnames'
import { Link } from 'react-router-dom'

interface IHeaderLogoProps {}

const HeaderLogo: FunctionComponent<IHeaderLogoProps> = () => {
    return (
        <span className={cx(['f4', styles.logo])}>
            <Link to={'/'}>
                Home
            </Link>
        </span>
    )
}

HeaderLogo.defaultProps = {}

export default HeaderLogo
