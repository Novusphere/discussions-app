import React, { FunctionComponent, useCallback, useContext } from 'react'
import { RootStoreContext } from '@stores'
import { observer } from 'mobx-react'
import { MODAL_OPTIONS } from '@globals'
import { ModalsSignIn } from '@components'

interface IModalsProps {}

const Modals: FunctionComponent<IModalsProps> = () => {
    const store = useContext(RootStoreContext)

    const handleOk = useCallback(() => {
        store.uiStore.clearActiveModal()
    }, [])

    const handleCancel = useCallback(() => {
        store.uiStore.clearActiveModal()
    }, [])

    switch (store.uiStore.activeModal) {
        case MODAL_OPTIONS.none:
            return null
        case MODAL_OPTIONS.signIn:
            return (
                <ModalsSignIn
                    visible={store.uiStore.activeModal === MODAL_OPTIONS.signIn}
                    handleOk={handleOk}
                    handleCancel={handleCancel}
                />
            )
    }
}

Modals.defaultProps = {}

export default observer(Modals)
