import React, { FunctionComponent } from 'react'
import { Button } from 'antd'

import styles from './HeaderLoggedOut.module.scss'

interface IHeaderLoggedOutProps {}

const HeaderLoggedOut: FunctionComponent<IHeaderLoggedOutProps> = () => {
    return (
        <>
            <Button size={'large'} style={{ marginRight: 10 }}>
                Login
            </Button>
            <Button size={'large'} type={'primary'}>
                Signup
            </Button>
        </>
    )
}

HeaderLoggedOut.defaultProps = {}

export default HeaderLoggedOut
