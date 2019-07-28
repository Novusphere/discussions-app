import * as React from 'react'
import { Modal, Form } from '@components'
import { IStores } from '@stores'
import { observer, inject } from 'mobx-react'
import { ModalOptions } from '@globals'

interface IWelcomeBackModalProps {
    authStore: IStores['authStore']
    uiStore: IStores['uiStore']
}

@inject('authStore', 'uiStore')
@observer
class WelcomeBackModal extends React.Component<IWelcomeBackModalProps> {
    public render() {
        const { signInForm } = this.props.authStore
        const { showModal } = this.props.uiStore

        return (
            <Modal>
                {({ CloseIcon }) => (
                    <>
                        <div className={'flex items-center justify-end'}>
                            <CloseIcon />
                        </div>

                        <div className={'tc ph2 mv3'}>
                            <span className={'black f2 b db'}>Welcome Back</span>
                            <span className={'f5 b db mt2'}>Sign into EOS</span>
                        </div>

                        <div
                            className={
                                'mt3 pb5 ph5-l ph2-m ph0-s flex flex-column items-center justify-center'
                            }
                        >
                            <Form
                                hideSubmitButton
                                form={signInForm}
                                className={'w-80-l w-100-s db tc'}
                            />

                            <button
                                className={'mt1 f5 link dim ph4 pv3 dib white bg-green pointer'}
                                type="submit"
                                onClick={signInForm.onSubmit}
                            >
                                Sign In
                            </button>

                            <span className={'f5 b mt3'}>
                                Don't have one?{' '}
                                <a onClick={() => showModal(ModalOptions.signUp)}>
                                    Create an account for free.
                                </a>
                            </span>
                        </div>
                    </>
                )}
            </Modal>
        )
    }
}


export default WelcomeBackModal as any
