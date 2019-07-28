import * as React from 'react'
import {
    Modal,
    SignInModalChooseAccountName,
    SignInModalGenerateKey,
    SignInModalVerification,
} from '@components'
import { observer, inject } from 'mobx-react'
import { IStores } from '@stores'

interface ISignInModalState {
    authStore?: IStores['authStore']
    currentStep: number
}

@inject('authStore')
@observer
class SignInModal extends React.Component<any, ISignInModalState> {
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

    private finishSignIn = () => {
        console.log('finished!')
    }

    private renderNextButtons = () => {
        const renderButton = (text: string, color: string, onClick) => {
            return (
                <button
                    className={'f6 link dim ph3 pv2 dib pointer white ' + color}
                    onClick={onClick}
                >
                    {text}
                </button>
            )
        }
        switch (this.state.currentStep) {
            case 1:
                return (
                    <>
                        {renderButton('Next', 'bg-green', this.goNext)}
                    </>
                )
            case 2:
                return (
                    <>
                        {renderButton('Previous', 'bg-blue', this.goBack)}
                        {renderButton('Next', 'bg-green', this.goNext)}
                    </>
                )
            case 3:
                return (
                    <>
                        {renderButton('Previous', 'bg-blue', this.goBack)}
                        {renderButton('Finish', 'bg-red', this.finishSignIn)}
                    </>
                )
        }
    }

    public render() {
        const { generateBrianKey } = this.props.authStore

        return (
            <Modal>
                {({ CloseIcon }) => (
                    <>
                        <div className={'flex items-center justify-end'}>
                            <CloseIcon />
                        </div>
                        <div className={'modal-body'}>
                            <SignInModalChooseAccountName
                                currentStep={this.state.currentStep}
                                onHeaderClick={() => this.setStep(1)}
                            />
                            <SignInModalGenerateKey
                                generateBrianKey={generateBrianKey}
                                currentStep={this.state.currentStep}
                                onHeaderClick={() => this.setStep(2)}
                            />
                            <SignInModalVerification
                                generateBrianKey={generateBrianKey}
                                currentStep={this.state.currentStep}
                                onHeaderClick={() => this.setStep(3)}
                            />
                        </div>
                        <div className={'modal-footer'}>{this.renderNextButtons()}</div>
                    </>
                )}
            </Modal>
        )
    }
}

export default SignInModal
