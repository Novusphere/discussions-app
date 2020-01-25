import * as React from 'react'
import Modal from 'react-modal'
import { IStores } from '@stores'
import { inject, observer, Observer } from 'mobx-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

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
                <Observer>
                    {() =>
                        (this.props.children as any)({
                            CloseButton: ({ onClick }) => (
                                <button
                                    className="f6 link dim ph3 pv2 dib white bg-gray white mr2 pointer"
                                    onClick={() => {
                                        if (typeof onClick !== 'undefined') onClick()
                                        else hideModal()
                                    }}
                                >
                                    Close
                                </button>
                            ),
                            CloseIcon: () => (
                                <span className={'black dim pointer'} onClick={() => hideModal()}>
                                    <FontAwesomeIcon icon={faTimes} size={'3x'} className={'pa4'} />
                                </span>
                            ),
                        })
                    }
                </Observer>
            </Modal>
        )
    }
}

export default ModalContainer as any
