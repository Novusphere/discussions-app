import * as React from 'react'
import {
    Modal,
    ChooseAccountName,
    GenerateKey,
    VerifyKey,
} from '@components'
import { observer, inject } from 'mobx-react'
import { IStores } from '@stores'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface ISignInModalProps {
    authStore: IStores['authStore']
}
interface ISignInModalState {
    currentStep: number
}

// TODO: Clean this up and make more modular

@inject('authStore')
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

    public setStep = step => {
        this.setState({
            currentStep: step,
        })
    }

    private saveBKToStore = () => {
        const { generateBrianKey, anonymousObject } = this.props.authStore

        const bk = generateBrianKey['result']
        console.log(bk)
        if (!anonymousObject.bk) {
            anonymousObject.bk = bk
        }
    }

    private renderNextButtons = (setAccountAndPasswordForm: any, verifyBKFormForm: any) => {
        const renderButton = (text: string, color: string, onClick, disabled?: boolean) => {
            const loading = onClick && onClick['state'] && onClick['pending']
            return (
                <button
                    disabled={onClick['pending'] || loading || disabled || false}
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
                        {renderButton(
                            'Next',
                            'bg-green',
                            e => {
                                setAccountAndPasswordForm.onSubmit(e)

                                if (!setAccountAndPasswordForm.form.hasError) {
                                    this.goNext()
                                }
                            },
                            setAccountAndPasswordForm.form.hasError
                        )}
                    </>
                )
            case 2:
                return (
                    <>
                        {renderButton('Previous', 'bg-blue', this.goBack)}
                        {renderButton('Next', 'bg-green', () => {
                            this.saveBKToStore()
                            this.goNext()
                        })}
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
                                verifyBKFormForm.onSubmit(e)

                                if (!verifyBKFormForm.form.hasError) {
                                    this.props.authStore.signUpAsAnonymousId()
                                }
                            },
                            verifyBKFormForm.form.hasError
                        )}
                    </>
                )
        }
    }

    public render() {
        const { generateBrianKey, setAccountAndPassword, verifyBKForm } = this.props.authStore

        const setAccountAndPasswordForm = setAccountAndPassword
        const verifyBKFormForm = verifyBKForm

        return (
            <Modal>
                {({ CloseIcon }) => (
                    <>
                        <div className={'flex items-center justify-end'}>
                            <CloseIcon />
                        </div>
                        <div className={'modal-body'}>
                            <ChooseAccountName
                                form={setAccountAndPasswordForm}
                                currentStep={this.state.currentStep}
                                onHeaderClick={() => this.setStep(1)}
                            />
                            <GenerateKey
                                generateBrianKey={generateBrianKey}
                                currentStep={this.state.currentStep}
                                onHeaderClick={() => this.setStep(2)}
                            />
                            <VerifyKey
                                form={verifyBKFormForm}
                                currentStep={this.state.currentStep}
                                onHeaderClick={() => this.setStep(3)}
                            />
                        </div>
                        <div className={'modal-footer'}>
                            {this.renderNextButtons(setAccountAndPasswordForm, verifyBKFormForm)}
                        </div>
                    </>
                )}
            </Modal>
        )
    }
}

export default SignUpModal as any
