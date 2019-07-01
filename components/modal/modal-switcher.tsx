import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'
import { ModalOptions } from '../../constants/globals'
import { Modal } from '@components'

interface IModalSwitcherProps {
    uiStore: IStores['uiStore']
}

@inject('uiStore')
@observer
class ModalSwitcher extends React.Component<IModalSwitcherProps> {
    public render(): React.ReactNode {
        switch (this.props.uiStore.activeModal) {
            case ModalOptions.walletUndetected:
                return (
                    <Modal>
                        <div className={'modal-header'}>I am a modal</div>
                        <div className={'modal-body'}>
                            Failed to detect a compatible EOS wallet! If your wallet is open, and we
                            failed to detect it try refreshing the page. However if you don't have a
                            compatible EOS wallet, you can still post to the forum anonymously for
                            free!
                        </div>
                        <div className={'modal-footer'}>Footer</div>
                    </Modal>
                )
            default:
                return null
        }
    }
}

export default ModalSwitcher as any
