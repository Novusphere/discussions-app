import * as React from 'react'
import { Modal, ChooseAccountName, GenerateKey, VerifyKey } from '@components'
import { observer, inject } from 'mobx-react'
import { IStores } from '@stores'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ModalOptions } from '@globals'

interface ISignInModalProps {
    newAuthStore: IStores['newAuthStore']
    uiStore: IStores['uiStore']
}
interface ISignInModalState {
    currentStep: number
}

@inject('newAuthStore', 'uiStore')
@observer
class SignUpModal extends React.Component<ISignInModalProps, ISignInModalState> {
    state = {
        currentStep: 1,
    }

    public goNext = () => {
        this.setState(prevState => ({
            currentStep: prevState.currentStep + 1,
        }))
    }

    public goBack = () => {
        this.setState(prevState => ({
            currentStep: prevState.currentStep - 1,
        }))
    }

    componentDidMount(): void {
        // this.setStep(1)
    }

    public setStep = step => {
        this.setState({
            currentStep: step,
        })
    }

    // private saveBKToStore = () => {
    //     const { generateBrianKey, anonymousObject } = this.props.authStore
    //
    //     const bk = generateBrianKey['result']
    //
    //     if (!anonymousObject.bk) {
    //         anonymousObject.bk = bk
    //     }
    // }
    //
    // private loginWithOtherMethod = () => {
    //     this.props.uiStore.showModal(ModalOptions.signIn)
    // }
    //
    private renderNextButtons = ({ signUpForm, verifyBKForm }) => {
        const { generateBrianKey } = this.props.newAuthStore

        const renderButton = (text: string, color: string, onClick, disabled = false) => {
            const loading = onClick && onClick['state'] && onClick['pending']
            return (
                <button
                    disabled={onClick['pending'] || loading || disabled}
                    className={'f6 link dim ph3 pv2 dib pointer white ' + color}
                    onClick={onClick}
                >
                    {loading ? <FontAwesomeIcon width={13} icon={faSpinner} spin /> : text}
                </button>
            )
        }
        switch (this.state.currentStep) {
            case 1:
                return (
                    <>
                        {/*{showOtherSignInOption && (*/}
                        {/*    <span className={'f6 b pointer dim'} onClick={this.loginWithOtherMethod}>*/}
                        {/*        Log in with another method*/}
                        {/*    </span>*/}
                        {/*)}*/}
                        {renderButton(
                            'Next',
                            'bg-green',
                            e => {
                                signUpForm.onSubmit(e)
                                this.goNext()
                            },
                            signUpForm.form.hasError
                        )}
                    </>
                )
            case 2:
                return (
                    <>
                        {renderButton('Previous', 'bg-blue', this.goBack)}
                        {renderButton(
                            'Next',
                            'bg-green',
                            () => {
                                this.goNext()
                            },
                            !generateBrianKey['result']
                        )}
                    </>
                )
            case 3:
                return (
                    <>
                        {renderButton('Previous', 'bg-blue', this.goBack)}
                        {renderButton(
                            'Finish',
                            'bg-red',
                            e => {
                                verifyBKForm.onSubmit(e)
                            },
                            verifyBKForm.form.hasError
                        )}
                    </>
                )
        }
    }

    public render() {
        // const { generateBrianKey, setAccountAndPassword, verifyBKForm } = this.props.authStore

        // const setAccountAndPasswordForm = setAccountAndPassword
        // const verifyBKFormForm = verifyBKForm

        const { signUpForm, verifyBKForm, generateBrianKey } = this.props.newAuthStore

        const _signUpForm = signUpForm
        const _verifyBKForm = verifyBKForm

        return (
            <Modal>
                {({ CloseIcon }) => (
                    <>
                        <div className={'flex items-center justify-end'}>
                            <CloseIcon />
                        </div>
                        <div className={'modal-body'}>
                            <ChooseAccountName
                                form={_signUpForm}
                                currentStep={this.state.currentStep}
                                onHeaderClick={() => null}
                            />
                            <GenerateKey
                                generateBrianKey={generateBrianKey}
                                currentStep={this.state.currentStep}
                                onHeaderClick={() => null}
                            />
                            <VerifyKey
                                form={_verifyBKForm}
                                currentStep={this.state.currentStep}
                                onHeaderClick={() => null}
                            />
                        </div>
                        <div className={'modal-footer'}>
                            {this.renderNextButtons({
                                signUpForm: _signUpForm,
                                verifyBKForm: _verifyBKForm,
                            })}
                        </div>
                    </>
                )}
            </Modal>
        )
    }
}

export default SignUpModal as any
