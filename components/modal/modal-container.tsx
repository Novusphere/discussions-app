import * as React from 'react'
import Modal from 'react-modal'
import { IStores } from '@stores/index'
import { inject, observer } from 'mobx-react'

interface IModalContainerProps {
    uiStore: IStores['uiStore']
}

@inject('uiStore')
@observer
class ModalContainer extends React.Component<IModalContainerProps> {
    public render(): React.ReactNode {
        const { isModalOpen, activeModal } = this.props.uiStore

        return (
            <Modal
                isOpen={isModalOpen}
                contentLabel={activeModal}
                className={'modal-content'}
                overlayClassName={'modal-dialog'}
                portalClassName={'modal modal-backdrop'}
                ariaHideApp={false}
            >
                {this.props.children}
            </Modal>
        )
    }
}

export default ModalContainer as any
