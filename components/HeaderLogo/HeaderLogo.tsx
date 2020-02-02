import React, { FunctionComponent } from 'react'
import { Typography } from 'antd'

const { Title } = Typography
import styles from './HeaderLogo.module.scss'

interface IHeaderLogoProps {}

const HeaderLogo: FunctionComponent<IHeaderLogoProps> = () => {
    return (
        <Title className={styles.logo} level={4}>
            Home
        </Title>
    )
}

HeaderLogo.defaultProps = {}

export default HeaderLogo
