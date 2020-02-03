import React, { FunctionComponent, useContext } from 'react'
import { Button } from 'antd'
import { RootStoreContext } from '@stores'
import { MODAL_OPTIONS } from '@globals'

interface IHeaderLoggedOutProps {}

const HeaderLoggedOut: FunctionComponent<IHeaderLoggedOutProps> = () => {
    const store = useContext(RootStoreContext)

    return (
        <>
            <Button
                size={'default'}
                style={{ marginRight: 10 }}
                onClick={() => store.uiStore.setActiveModal(MODAL_OPTIONS.signIn)}
            >
                Login
            </Button>
            <Button size={'default'} type={'primary'}>
                Signup
            </Button>
        </>
    )
}

HeaderLoggedOut.defaultProps = {}

export default HeaderLoggedOut
