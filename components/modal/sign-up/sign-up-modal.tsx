import * as React from 'react'
import { Modal, ChooseAccountName, GenerateKey, VerifyKey } from '@components'
import { observer, inject } from 'mobx-react'
import { IStores } from '@stores'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface ISignInModalProps {
    uiStore: IStores['uiStore']
    signUpStore: IStores['signUpStore']
}
interface ISignInModalState {}

@inject('signUpStore', 'uiStore')
@observer
class SignUpModal extends React.Component<ISignInModalProps, ISignInModalState> {
    private renderNextButtons = ({ signUpForm, verifyBKForm }) => {
        const { generateBrianKey, uiForm, goBack, goNext } = this.props.signUpStore

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
        switch (uiForm.currentStep) {
            case 1:
                return (
                    <>
                        {renderButton(
                            'Next',
                            'bg-green',
                            e => {
                                signUpForm.onSubmit(e)
                                goNext()
                            },
                            signUpForm.Form ? signUpForm.Form.hasError : false,
                        )}
                    </>
                )
            case 2:
                return (
                    <>
                        {renderButton('Previous', 'bg-blue', goBack)}
                        {renderButton(
                            'Next',
                            'bg-green',
                            () => {
                                goNext()
                            },
                            !generateBrianKey['result']
                        )}
                    </>
                )
            case 3:
                return (
                    <>
                        {renderButton('Previous', 'bg-blue', goBack)}
                        {renderButton(
                            'Finish',
                            'bg-red',
                            e => {
                                verifyBKForm.onSubmit(e)
                            },
                            verifyBKForm.Form && verifyBKForm.Form.hasError
                        )}
                    </>
                )
        }
    }

    public render() {
        // const { generateBrianKey, setAccountAndPassword, verifyBKForm } = this.props.authStore

        // const setAccountAndPasswordForm = setAccountAndPassword
        // const verifyBKFormForm = verifyBKForm

        const { signUpForm, verifyBKForm, generateBrianKey, uiForm } = this.props.signUpStore

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
                                currentStep={uiForm.currentStep}
                                onHeaderClick={() => null}
                            />
                            <GenerateKey
                                generateBrianKey={generateBrianKey}
                                currentStep={uiForm.currentStep}
                                onHeaderClick={() => null}
                            />
                            <VerifyKey
                                form={_verifyBKForm}
                                currentStep={uiForm.currentStep}
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
