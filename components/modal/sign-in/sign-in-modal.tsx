import * as React from 'react'
import {
    Modal,
    ScatterSelectSignInOption,
    ScatterSetBrianKey,
    ScatterSetPassword,
    SuccessSetup,
    AskForPassword,
} from '@components'
import { IStores } from '@stores'
import { observer, inject } from 'mobx-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { SignInMethods } from '@globals'
import { SignInOptions } from '@constants/sign-in-options'
import dynamic from 'next/dynamic'

const StepWizard: any = dynamic(() => import('react-step-wizard'))

interface IWelcomeBackModalProps {
    authStore: IStores['authStore']
    uiStore: IStores['uiStore']
}

interface IWelcomeBackModalState {
    clickedSignInOption: string
}

@inject('authStore', 'uiStore')
@observer
class SignInModal extends React.Component<IWelcomeBackModalProps, IWelcomeBackModalState> {
    state = {
        clickedSignInOption: '',
    }

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

    // componentDidMount(): void {
    //     if (this.props.authStore.signInObject.instance) {
    //         this.props.authStore.signInObjectState(1)
    //     }
    // }

    closeModal = () => {
        this.props.uiStore.hideModal()
    }

    renderButtons = (choosePasswordForm: any, setPassword: any) => {
        if (this.props.authStore.signInObject.instance) {
            switch (this.props.authStore.signInObject.currentStep) {
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
                            if (this.props.authStore.loginWithScatter['pending']) {
                                return (
                                    <button
                                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                        disabled={this.props.authStore.loginWithScatter['pending']}
                                    >
                                        <FontAwesomeIcon width={13} icon={faSpinner} spin />
                                    </button>
                                )
                            }
                            return (
                                <button
                                    onClick={this.props.authStore.loginWithScatter}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                    disabled={!this.state.clickedSignInOption}
                                >
                                    Sign in via Scatter
                                </button>
                            )
                        case SignInMethods.brainKey:
                            if (this.props.authStore.loginWithBrainKey['pending']) {
                                return (
                                    <button
                                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                        disabled={this.props.authStore.loginWithBrainKey['pending']}
                                    >
                                        <FontAwesomeIcon width={13} icon={faSpinner} spin />
                                    </button>
                                )
                            }
                            return (
                                <button
                                    onClick={this.props.authStore.loginWithBrainKey}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                    disabled={!this.state.clickedSignInOption}
                                >
                                    Sign in via Brain Key
                                </button>
                            )
                    }
                    break
                case 2:
                    return (
                        <>
                            <button
                                onClick={this.props.authStore.signInObject_prevStep}
                                className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                            >
                                Back
                            </button>
                            <button
                                onClick={this.props.authStore.signInObject_nextStep}
                                className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                            >
                                Next step: set password
                            </button>
                        </>
                    )
                case 3:
                    return this.props.authStore.setupBKKeysToScatter['match']({
                        rejected: error => (
                            <>
                                {JSON.stringify(error)}
                                <button
                                    onClick={this.props.authStore.signInObject_prevStep}
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
                                    onClick={choosePasswordForm.onSubmit}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                >
                                    Finish
                                </button>
                            </>
                        ),
                        pending: () => (
                            <>
                                <button
                                    disabled={this.props.authStore.setupBKKeysToScatter['pending']}
                                    onClick={this.props.authStore.signInObject_prevStep}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                >
                                    Back
                                </button>
                                <button
                                    disabled={this.props.authStore.setupBKKeysToScatter['pending']}
                                    type="submit"
                                    onClick={choosePasswordForm.onSubmit}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                >
                                    <FontAwesomeIcon width={13} icon={faSpinner} spin />
                                </button>
                            </>
                        ),
                        resolved: () => (
                            <>
                                <button
                                    onClick={this.props.authStore.signInObject_prevStep}
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
                                    onClick={choosePasswordForm.onSubmit}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                >
                                    Finish
                                </button>
                            </>
                        ),
                    })
                case 5:
                    return <span>Test</span>
                case 4:
                case 6:
                    return this.props.authStore.loginWithPassword['match']({
                        rejected: error => (
                            <>
                                {JSON.stringify(error)}
                                <button
                                    disabled={this.props.authStore.loginWithPassword['pending']}
                                    onClick={setPassword.onSubmit}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-red'}
                                >
                                    Log In
                                </button>
                            </>
                        ),
                        pending: () => (
                            <button
                                disabled={this.props.authStore.loginWithPassword['pending']}
                                onClick={setPassword.onSubmit}
                                className={'f6 link dim ph3 pv2 dib pointer white bg-red'}
                            >
                                <FontAwesomeIcon width={13} icon={faSpinner} spin />
                            </button>
                        ),
                        resolved: () => (
                            <>
                                <span
                                    className={'b pointer dim'}
                                    title={'Sign in with another sign in boost'}
                                    onClick={() => this.props.authStore.signInObjectState(1)}
                                >
                                    Or log in with another sign in method
                                </span>{' '}
                                <button
                                    disabled={this.props.authStore.loginWithPassword['pending']}
                                    onClick={setPassword.onSubmit}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-red'}
                                >
                                    Log In
                                </button>
                            </>
                        ),
                    })
            }
        }
    }

    private renderRememberOption = () => {
        if (this.props.authStore.signInObject.currentStep === 1) {
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

    setInstance = instance => {
        this.props.authStore.signInObject.instance = instance
    }

    public render() {
        const choosePasswordForm = this.props.authStore.choosePassword
        const setPassword = this.props.authStore.setPassword

        return (
            <Modal>
                {({ CloseIcon }) => (
                    <>
                        <div className={'flex items-center justify-end'}>
                            <CloseIcon />
                        </div>

                        <StepWizard
                            instance={this.setInstance}
                            initialStep={this.props.authStore.signInObject.currentStep}
                        >
                            {/* Scatter Steps */}
                            <ScatterSelectSignInOption
                                signInOptions={SignInOptions}
                                optionOnClick={this.clickSignIn}
                                clickedSignInOption={this.state.clickedSignInOption}
                            />
                            <ScatterSetBrianKey
                                generateBrianKey={this.props.authStore.generateBrianKey}
                            />
                            <ScatterSetPassword setPasswordForm={choosePasswordForm} />

                            <AskForPassword askPasswordForm={setPassword} />
                            <SuccessSetup />
                        </StepWizard>

                        <div className={'modal-footer'}>
                            {this.renderRememberOption()}
                            {this.renderButtons(choosePasswordForm, setPassword)}
                        </div>
                    </>
                )}
            </Modal>
        )
    }
}


export default SignInModal as any
