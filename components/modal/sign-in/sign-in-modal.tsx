import * as React from 'react'
import {
    Modal,
    SignInModalOptions,
    SuccessSetup,
    SetNewBK,
    ScatterAskForPassword,
    BrainKeySetPassword,
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
    newAuthStore: IStores['newAuthStore']
    uiStore: IStores['uiStore']
}

interface IWelcomeBackModalState {
    clickedSignInOption: string
}

@inject('newAuthStore', 'uiStore')
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

    renderButtons = (choosePasswordForm: any, setPassword: any, setNewBKAndPasswordForm: any, setPasswordScatter: any) => {
        const {
            signInObject,
            initializeScatterLogin,
            loginWithBK,
            handleStepSwitchForBK,
            hasBKAccount,
        } = this.props.newAuthStore

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
                            if (initializeScatterLogin['pending']) {
                                return (
                                    <button
                                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                        disabled={initializeScatterLogin['pending']}
                                    >
                                        <FontAwesomeIcon width={13} icon={faSpinner} spin />
                                    </button>
                                )
                            }
                            return (
                                <button
                                    onClick={initializeScatterLogin}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                    disabled={!this.state.clickedSignInOption}
                                >
                                    Sign in via Scatter
                                </button>
                            )
                        case SignInMethods.brainKey:
                            if (hasBKAccount && loginWithBK['pending']) {
                                return (
                                    <button
                                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                        disabled={loginWithBK['pending']}
                                    >
                                        <FontAwesomeIcon width={13} icon={faSpinner} spin />
                                    </button>
                                )
                            }
                            return (
                                <>
                                    <button
                                        onClick={() => {
                                            signInObject.ref.goToStep(2)
                                        }}
                                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                                        disabled={!this.state.clickedSignInOption}
                                    >
                                        Sign in via another brain key
                                    </button>
                                    {hasBKAccount ? (
                                        <button
                                            onClick={handleStepSwitchForBK}
                                            className={
                                                'f6 link dim ph3 pv2 dib pointer white bg-green'
                                            }
                                            disabled={!this.state.clickedSignInOption}
                                        >
                                            Continue as {hasBKAccount}
                                        </button>
                                    ) : null}
                                </>
                            )
                    }
                    break
                case 2:
                    return this.props.newAuthStore.loginWithBK['match']({
                        rejected: error => (
                            <>
                                {JSON.stringify(error)}
                                <button
                                    disabled={this.props.newAuthStore.loginWithBK['pending']}
                                    onClick={setNewBKAndPasswordForm.onSubmit}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-red'}
                                >
                                    Log In
                                </button>
                            </>
                        ),
                        pending: () => (
                            <button
                                disabled={this.props.newAuthStore.loginWithBK['pending']}
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
                                    onClick={() =>
                                        this.props.newAuthStore.signInObject.ref.goToStep(1)
                                    }
                                >
                                    Or log in with another sign in method
                                </span>{' '}
                                <button
                                    disabled={this.props.newAuthStore.loginWithBK['pending']}
                                    onClick={setNewBKAndPasswordForm.onSubmit}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-red'}
                                >
                                    Setup and login with new account
                                </button>
                            </>
                        ),
                    })
                case 3:
                    return this.props.newAuthStore.loginWithPassword['match']({
                        rejected: () => (
                            <>
                                <button
                                    disabled={this.props.newAuthStore.loginWithPassword['pending']}
                                    onClick={setPassword.onSubmit}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-red'}
                                >
                                    Log In
                                </button>
                            </>
                        ),
                        pending: () => (
                            <button
                                disabled={this.props.newAuthStore.loginWithPassword['pending']}
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
                                    onClick={() =>
                                        this.props.newAuthStore.signInObject.ref.goToStep(1)
                                    }
                                >
                                    Or log in with another sign in method
                                </span>{' '}
                                <button
                                    disabled={this.props.newAuthStore.loginWithPassword['pending']}
                                    onClick={setPassword.onSubmit}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-red'}
                                >
                                    Log In as {hasBKAccount}
                                </button>
                            </>
                        ),
                    })
                case 4:
                    break
                case 5:
                    return this.props.newAuthStore.initializeScatterLogin['match']({
                        rejected: () => (
                            <>
                                <button
                                    disabled={this.props.newAuthStore.initializeScatterLogin['pending']}
                                    onClick={setPasswordScatter.onSubmit}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-red'}
                                >
                                    Log In
                                </button>
                            </>
                        ),
                        pending: () => (
                            <button
                                disabled={this.props.newAuthStore.initializeScatterLogin['pending']}
                                onClick={setPasswordScatter.onSubmit}
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
                                    onClick={() =>
                                        this.props.newAuthStore.signInObject.ref.goToStep(1)
                                    }
                                >
                                    Or log in with another sign in method
                                </span>{' '}
                                <button
                                    disabled={this.props.newAuthStore.initializeScatterLogin['pending']}
                                    onClick={setPasswordScatter.onSubmit}
                                    className={'f6 link dim ph3 pv2 dib pointer white bg-red'}
                                >
                                    Log In with Scatter
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

    onStepChange = ({ activeStep }) => {
        this.props.newAuthStore.signInObject.step = activeStep
    }

    setInstance = instance => {
        this.props.newAuthStore.signInObject.ref = instance
    }

    public render() {
        const { signInObject } = this.props.newAuthStore
        const choosePasswordForm = this.props.newAuthStore.choosePassword
        const setPasswordBK = this.props.newAuthStore.setPasswordBK
        const setPasswordScatter = this.props.newAuthStore.setPasswordScatter
        const setNewBKAndPasswordForm = this.props.newAuthStore.setNewBKAndPasswordForm

        return (
            <Modal>
                {({ CloseIcon }) => (
                    <>
                        <div className={'flex items-center justify-end'}>
                            <CloseIcon />
                        </div>

                        <StepWizard
                            instance={this.setInstance}
                            initialStep={signInObject.step}
                            onStepChange={this.onStepChange}
                        >
                            <SignInModalOptions
                                signInOptions={SignInOptions}
                                optionOnClick={this.clickSignIn}
                                clickedSignInOption={this.state.clickedSignInOption}
                            />
                            <SetNewBK form={setNewBKAndPasswordForm} />
                            <BrainKeySetPassword form={setPasswordBK} />
                            <SuccessSetup />

                            <ScatterAskForPassword form={setPasswordScatter} />
                        </StepWizard>

                        <div className={'modal-footer'}>
                            {this.renderRememberOption()}
                            {this.renderButtons(
                                choosePasswordForm,
                                setPasswordBK,
                                setNewBKAndPasswordForm,
                                setPasswordScatter
                            )}
                        </div>
                    </>
                )}
            </Modal>
        )
    }
}


export default SignInModal as any
