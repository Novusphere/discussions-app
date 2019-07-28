import * as React from 'react'
import {
    Modal,
    SignInModalChooseAccountName,
    SignInModalGenerateKey,
    SignInModalVerification,
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

    private renderNextButtons = () => {
        const renderButton = (text: string, color: string, onClick) => {
            const loading = onClick && onClick['state'] && onClick['pending']
            return (
                <button
                    disabled={loading || false}
                    className={'f6 link dim ph3 pv2 dib pointer white ' + color}
                    onClick={onClick}
                >
                    {loading ? <FontAwesomeIcon width={13} icon={faSpinner} spin /> : text}
                </button>
            )
        }
        switch (this.state.currentStep) {
            case 1:
                return <>{renderButton('Next', 'bg-green', this.goNext)}</>
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
                        {renderButton('Finish', 'bg-red', this.props.authStore.signInWithBrianKey)}
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

export default SignUpModal as any
