import React, { FunctionComponent } from 'react'
import { Button } from 'antd'
import { MODAL_OPTIONS } from '@globals'
import { useStores } from '@stores'

interface IHeaderLoggedOutProps {}

const HeaderLoggedOut: FunctionComponent<IHeaderLoggedOutProps> = () => {
    const { uiStore } = useStores()

    return (
        <>
            <Button
                disabled={false}
                size={'default'}
                style={{ marginRight: 10 }}
                onClick={() => uiStore.setActiveModal(MODAL_OPTIONS.signIn)}
            >
                Login
            </Button>
            <Button
                disabled={false}
                size={'default'}
                type={'primary'}
                onClick={() => uiStore.setActiveModal(MODAL_OPTIONS.signUp)}
            >
                Signup
            </Button>
        </>
    )
}

HeaderLoggedOut.defaultProps = {}

export default HeaderLoggedOut
