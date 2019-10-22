import * as React from 'react'
import {
    Modal,
    SignInModalOptions,
    SignInModalSetBK,
    SignInModalSetPassword,
    SuccessSetup,
    AskForPassword,
    SetNewBK,
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
    newAuthStore: IStores['newAuthStore']
    uiStore: IStores['uiStore']
}

interface IWelcomeBackModalState {
    clickedSignInOption: string
}

@inject('authStore', 'newAuthStore', 'uiStore')
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

        this.props.newAuthStore.setClickedSignInMethod(name)
    }

    renderButtons = (choosePasswordForm: any, setPassword: any, setNewBKAndPasswordForm: any) => {
        const { signInObject, loginWithScatter, loginWithBrainKey } = this.props.newAuthStore

        if (signInObject.ref) {
            switch (signInObject.step) {
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
                            if (loginWithScatter['pending']) {
                                return (
                                    <button
                                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                        disabled={loginWithScatter['pending']}
                                    >
                                        <FontAwesomeIcon width={13} icon={faSpinner} spin />
                                    </button>
                                )
                            }
                            return (
                                <button
                                    onClick={loginWithScatter}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                    disabled={!this.state.clickedSignInOption}
                                >
                                    Sign in via Scatter
                                </button>
                            )
                        case SignInMethods.brainKey:
                            if (loginWithBrainKey['pending']) {
                                return (
                                    <button
                                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                        disabled={loginWithBrainKey['pending']}
                                    >
                                        <FontAwesomeIcon width={13} icon={faSpinner} spin />
                                    </button>
                                )
                            }
                            return (
                                <button
                                    onClick={loginWithBrainKey}
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
                                    onClick={() => this.props.authStore.signInObjectState(6)}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-primary'}
                                >
                                    Use another BK
                                </button>{' '}
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
                case 6:
                    return this.props.authStore.loginWithBK['match']({
                        rejected: error => (
                            <>
                                {JSON.stringify(error)}
                                <button
                                    disabled={this.props.authStore.loginWithBK['pending']}
                                    onClick={setNewBKAndPasswordForm.onSubmit}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-red'}
                                >
                                    Log In
                                </button>
                            </>
                        ),
                        pending: () => (
                            <button
                                disabled={this.props.authStore.loginWithBK['pending']}
                                onClick={setNewBKAndPasswordForm.onSubmit}
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
                                    disabled={this.props.authStore.loginWithBK['pending']}
                                    onClick={setNewBKAndPasswordForm.onSubmit}
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

    private handleRememberClick = () => {
        const { setPreferredSignInMethod } = this.props.newAuthStore
        setPreferredSignInMethod(this.state.clickedSignInOption)
    }

    private renderRememberOption = () => {
        const { signInObject, preferredSignInMethod } = this.props.newAuthStore

        if (signInObject.step === 1) {
            return (
                <span className={'flex items-center'}>
                    <input
                        onChange={this.handleRememberClick}
                        type="checkbox"
                        id="rememberOption"
                        name="rememberOption"
                        checked={preferredSignInMethod === this.state.clickedSignInOption}
                    />
                    <label htmlFor="rememberOption" className={'ml2 f6'}>
                        Automatically select this option next time
                    </label>
                </span>
            )
        }
    }

    setInstance = instance => {
        this.props.newAuthStore.signInObject.ref = instance
    }

    public render() {
        const { signInObject } = this.props.newAuthStore

        const choosePasswordForm = this.props.authStore.choosePassword
        const setPassword = this.props.authStore.setPassword
        const setNewBKAndPasswordForm = this.props.authStore.setNewBKAndPasswordForm

        return (
            <Modal>
                {({ CloseIcon }) => (
                    <>
                        <div className={'flex items-center justify-end'}>
                            <CloseIcon />
                        </div>

                        <StepWizard instance={this.setInstance} initialStep={signInObject.step}>
                            {/* Scatter Steps */}
                            <SignInModalOptions
                                signInOptions={SignInOptions}
                                optionOnClick={this.clickSignIn}
                                clickedSignInOption={this.state.clickedSignInOption}
                            />
                            <SignInModalSetBK
                                generateBrianKey={this.props.authStore.generateBrianKey}
                            />
                            <SignInModalSetPassword setPasswordForm={choosePasswordForm} />
                            <AskForPassword askPasswordForm={setPassword} />
                            <SuccessSetup />

                            <SetNewBK form={setNewBKAndPasswordForm} />
                        </StepWizard>

                        <div className={'modal-footer'}>
                            {this.renderRememberOption()}
                            {this.renderButtons(
                                choosePasswordForm,
                                setPassword,
                                setNewBKAndPasswordForm
                            )}
                        </div>
                    </>
                )}
            </Modal>
        )
    }
}


export default SignInModal as any
