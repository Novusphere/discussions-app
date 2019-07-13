import * as React from 'react'
import Modal from 'react-modal'
import { IStores } from '@stores'
import { inject, observer } from 'mobx-react'

interface IModalContainerProps {
    uiStore: IStores['uiStore']
}

@inject('uiStore')
@observer
class ModalContainer extends React.Component<IModalContainerProps> {
    public render(): React.ReactNode {
        const { isModalOpen, activeModal, hideModal } = this.props.uiStore

        return (
            <Modal
                shouldCloseOnEsc
                shouldCloseOnOverlayClick
                isOpen={isModalOpen}
                contentLabel={activeModal}
                className={'modal-content'}
                overlayClassName={'modal-dialog'}
                onRequestClose={() => hideModal()}
                portalClassName={'modal modal-backdrop'}
                ariaHideApp={false}
            >
                {(this.props.children as any)({
                    CloseButton: () => (
                        <a
                            className="f6 link dim br2 ph3 pv2 dib white bg-green mr2 pointer"
                            onClick={() => hideModal()}
                        >
                            Close
                        </a>
                    ),
                })}
            </Modal>
        )
    }
}

export default ModalContainer as any
