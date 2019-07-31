import * as React from 'react'
import { Modal, SelectSignInOption, SetBrianKey, SetPassword, SuccessSetup } from '@components'
import { IStores } from '@stores'
import { observer, inject } from 'mobx-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { SignInMethods } from '@globals'
import { SignInOptions } from '@constants/sign-in-options'
import { task } from 'mobx-task'
import { StepProps } from '@d.ts/declarations'
import dynamic from 'next/dynamic'
import { observable } from 'mobx'

const StepWizard: any = dynamic(() => import('react-step-wizard'))

interface IWelcomeBackModalProps {
    authStore: IStores['authStore']
    uiStore: IStores['uiStore']
}

interface IWelcomeBackModalState {
    currentStep: number
    clickedSignInOption: string
}

@inject('authStore', 'uiStore')
@observer
class SignInModal extends React.Component<IWelcomeBackModalProps, IWelcomeBackModalState> {
    state = {
        currentStep: 3,
        clickedSignInOption: '',
    }

    @observable.deep private instance: StepProps

    private clickSignIn = (name: string) => {
        if (this.state.clickedSignInOption === name) {
            this.setState({
                clickedSignInOption: '',
            })
        } else {
            this.setState({
                clickedSignInOption: name,
            })
        }
    }

    private setStepInState = (stepNumber: number) => {
        this.setState({ currentStep: stepNumber })
    }

    private nextStep = () => {
        this.setStepInState(this.state.currentStep + 1)
        this.instance.nextStep()
        this.instance.setActiveStep(this.instance.state.activeStep + 1)
    }

    private prevStep = () => {
        this.setStepInState(this.state.currentStep - 1)
        this.instance.previousStep()
        this.instance.setActiveStep(this.instance.state.activeStep - 1)
    }

    @task.resolved
    private signInViaWallet = async () => {
        const { generateBrianKey } = this.props.authStore

        this.nextStep()
        await generateBrianKey()

        // const { signInViaWallet, generateBrianKey } = this.props.authStore
        //
        // const result = await signInViaWallet()
        //
        // if (typeof result === 'undefined') {
        //     this.nextStep()
        //     await generateBrianKey()
        // }
        //
        // if (result === false) {
        //     console.log('no wallet detected')
        // }
        //
        // if (result) {
        //     console.log('it worked!')
        // }
    }

    closeModal = () => {
        this.props.uiStore.hideModal()
    }

    renderButtons = (choosePasswordForm: any) => {
        if (this.instance) {
            switch (this.state.currentStep) {
                case 1:
                    if (!this.state.clickedSignInOption) {
                        return (
                            <button
                                className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                disabled={!this.state.clickedSignInOption}
                            >
                                Select a sign in method
                            </button>
                        )
                    }

                    switch (this.state.clickedSignInOption) {
                        case SignInMethods.scatter:
                            return (
                                <button
                                    onClick={this.signInViaWallet}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                    disabled={
                                        !this.state.clickedSignInOption ||
                                        this.signInViaWallet['pending']
                                    }
                                >
                                    {this.signInViaWallet['pending'] ? (
                                        <FontAwesomeIcon width={13} icon={faSpinner} spin />
                                    ) : (
                                        'Sign in via Scatter'
                                    )}
                                </button>
                            )
                    }
                    break
                case 2:
                    return (
                        <>
                            <button
                                onClick={this.prevStep}
                                className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                            >
                                Back
                            </button>
                            <button
                                onClick={this.nextStep}
                                className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                            >
                                Choose password
                            </button>
                        </>
                    )
                case 3:
                    return (
                        <>
                            <button
                                onClick={this.prevStep}
                                className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                            >
                                Back
                            </button>
                            <button
                                disabled={
                                    choosePasswordForm.form.hasError ||
                                    choosePasswordForm.form.isEmpty
                                }
                                type="submit"
                                onClick={e => {
                                    choosePasswordForm.onSubmit(e)
                                    if (!choosePasswordForm.form.hasError) {
                                        this.nextStep()
                                    }
                                }}
                                className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                            >
                                Continue
                            </button>
                        </>
                    )
                case 4:
                    return (
                        <button
                            onClick={this.closeModal}
                            className={'f6 link dim ph3 pv2 dib pointer white bg-red'}
                        >
                            Finish
                        </button>
                    )
            }
        }
    }

    private renderRememberOption = () => {
        if (this.state.currentStep === 1) {
            return (
                <span className={'flex items-center'}>
                    <input
                        onChange={() =>
                            this.props.authStore.setPreferredSignInMethod(
                                this.state.clickedSignInOption
                            )
                        }
                        disabled={!this.state.clickedSignInOption}
                        type="checkbox"
                        id="rememberOption"
                        name="rememberOption"
                        checked={
                            this.props.authStore.preferredSignInMethod ===
                            this.state.clickedSignInOption
                        }
                    />
                    <label htmlFor="rememberOption" className={'ml2 f6'}>
                        Automatically select this option next time
                    </label>
                </span>
            )
        }
    }

    public render() {
        const choosePasswordForm = this.props.authStore.choosePassword
        return (
            <Modal>
                {({ CloseIcon }) => (
                    <>
                        <div className={'flex items-center justify-end'}>
                            <CloseIcon />
                        </div>

                        <StepWizard
                            instance={instance => (this.instance = instance)}
                            initialStep={3}
                        >
                            <SelectSignInOption
                                signInOptions={SignInOptions}
                                optionOnClick={this.clickSignIn}
                                clickedSignInOption={this.state.clickedSignInOption}
                            />
                            <SetBrianKey generateBrianKey={this.props.authStore.generateBrianKey} />
                            <SetPassword setPasswordForm={choosePasswordForm} />
                            <SuccessSetup />
                        </StepWizard>

                        <div className={'modal-footer'}>
                            {this.renderRememberOption()}

                            {this.renderButtons(choosePasswordForm)}
                        </div>
                    </>
                )}
            </Modal>
        )
    }
}


export default SignInModal as any
