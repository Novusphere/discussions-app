import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { ModalOptions } from '@globals'
import { Modal } from '@components'

interface IModalSwitcherProps {
    uiStore: IStores['uiStore']
}

// TODO: Split modals out into components

@inject('uiStore')
@observer
class ModalSwitcher extends React.Component<IModalSwitcherProps> {
    public render(): React.ReactNode {
        switch (this.props.uiStore.activeModal) {
            case ModalOptions.walletUndetected:
                return (
                    <Modal>
                        {({ CloseButton }) => (
                            <>
                                <div className={'modal-header'}>Unable to detect wallet</div>
                                <div className={'modal-body'}>
                                    Failed to detect a compatible EOS wallet! If your wallet is
                                    open, and we failed to detect it try refreshing the page.
                                    However if you don't have a compatible EOS wallet, you can still
                                    post to the forum anonymously for free!
                                </div>
                                <div className={'modal-footer'}>
                                    <CloseButton />
                                </div>
                            </>
                        )}
                    </Modal>
                )
            default:
                return null
        }
    }
}

export default ModalSwitcher as any
