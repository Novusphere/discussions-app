import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { ModalOptions } from '@globals'
import { WalletUndetectedModal, SignInModal, WelcomeBackModal } from '@components'

interface IModalSwitcherProps {
    uiStore: IStores['uiStore']
}

@inject('uiStore')
@observer
class ModalSwitcher extends React.Component<IModalSwitcherProps> {
    public render(): React.ReactNode {
        switch (this.props.uiStore.activeModal) {
            case ModalOptions.walletUndetected:
                return <WalletUndetectedModal />
            case ModalOptions.signIn:
                return <SignInModal />
            case ModalOptions.welcomeBack:
                return <WelcomeBackModal />
            default:
                return null
        }
    }
}

export default ModalSwitcher as any
