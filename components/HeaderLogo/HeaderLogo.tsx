import React, { FunctionComponent } from 'react'
import { Typography } from 'antd'

const { Title } = Typography
import styles from './HeaderLogo.module.scss'
import Link from 'next/link'

interface IHeaderLogoProps {}

const HeaderLogo: FunctionComponent<IHeaderLogoProps> = () => {
    return (
        <Title className={styles.logo} level={4}>
            <Link href={'/'}>
                <a>Home</a>
            </Link>
        </Title>
    )
}

HeaderLogo.defaultProps = {}

export default HeaderLogo
