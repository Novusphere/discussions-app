import React, { FunctionComponent, useCallback } from 'react'
import { observer } from 'mobx-react'
import { MODAL_OPTIONS } from '@globals'
import { ModalsNewCampaign, ModalsPasswordReEntry, ModalsSignIn, ModalsSignUp } from '@components'
import { useStores } from '@stores'

interface IModalsProps {}

const Modals: FunctionComponent<IModalsProps> = () => {
    const { uiStore } = useStores()

    const handleOk = useCallback(() => {
        uiStore.clearActiveModal()
    }, [])

    const handleCancel = useCallback(() => {
        uiStore.clearActiveModal()
    }, [])

    switch (uiStore.activeModal) {
        case MODAL_OPTIONS.none:
            return null
        case MODAL_OPTIONS.signIn:
            return (
                <ModalsSignIn
                    visible={uiStore.activeModal === MODAL_OPTIONS.signIn}
                    handleOk={handleOk}
                    handleCancel={handleCancel}
                />
            )
        case MODAL_OPTIONS.signUp:
            return (
                <ModalsSignUp
                    visible={uiStore.activeModal === MODAL_OPTIONS.signUp}
                    handleOk={handleOk}
                    handleCancel={handleCancel}
                />
            )
        case MODAL_OPTIONS.walletActionPasswordReentry:
            return (
                <ModalsPasswordReEntry
                    visible={uiStore.activeModal === MODAL_OPTIONS.walletActionPasswordReentry}
                    handleOk={handleOk}
                    handleCancel={handleCancel}
                />
            )
        case MODAL_OPTIONS.createNewCampaign:
            return (
                <ModalsNewCampaign
                    visible={uiStore.activeModal === MODAL_OPTIONS.createNewCampaign}
                    handleOk={handleOk}
                    handleCancel={handleCancel}
                />
            )
    }
}

Modals.defaultProps = {}

export default observer(Modals)
