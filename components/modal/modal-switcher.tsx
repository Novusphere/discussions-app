import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { ModalOptions } from '@globals'
import { WalletUndetectedModal, SignInModal, SignUpModal, PostWarningCloseModal, WalletActionPasswordReEntry } from '@components'

interface IModalSwitcherProps {
    uiStore: IStores['uiStore']
}

@inject('uiStore')
@observer
class ModalSwitcher extends React.Component<IModalSwitcherProps> {
    public render(): React.ReactNode {
        switch (this.props.uiStore.activeModal) {
            case ModalOptions.signIn:
                return <SignInModal />
            case ModalOptions.signUp:
                return <SignUpModal />
            case ModalOptions.walletUndetected:
                return <WalletUndetectedModal />
            case ModalOptions.postWarningClose:
                return <PostWarningCloseModal />
            case ModalOptions.walletActionPasswordReentry:
                return <WalletActionPasswordReEntry />
            default:
                return null
        }
    }
}

export default ModalSwitcher as any
