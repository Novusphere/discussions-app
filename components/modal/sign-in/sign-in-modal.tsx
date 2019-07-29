import * as React from 'react'
import { Modal, SelectSignInOption, SetBrianKey, SetPassword } from '@components'
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
}

interface IWelcomeBackModalState {
    clickedSignInOption: string
}

@inject('authStore')
@observer
class SignInModal extends React.Component<IWelcomeBackModalProps, IWelcomeBackModalState> {
    state = {
        clickedSignInOption: '',
    }

    @observable private instance: StepProps

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

    @task.resolved
    private signInViaWallet = async () => {
        const { generateBrianKey } = this.props.authStore

        this.instance.nextStep()
        await generateBrianKey()

        // const { signInViaWallet, generateBrianKey } = this.props.authStore
        //
        // const result = await signInViaWallet()
        //
        // if (typeof result === 'undefined') {
        //     this.instance.nextStep()
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

    renderButtons = () => {
        if (this.instance) {
            switch (this.instance.state.activeStep) {
                case 0:
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
                case 1:
                    return (
                        <button
                            onClick={this.instance.nextStep}
                            className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                        >
                            Choose password
                        </button>
                    )
            }
        }
    }

    private renderRememberOption = () => {
        if (this.instance && this.instance.state.activeStep === 0) {
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
        return (
            <Modal>
                {({ CloseIcon }) => (
                    <>
                        <div className={'flex items-center justify-end'}>
                            <CloseIcon />
                        </div>

                        <StepWizard instance={instance => (this.instance = instance)} initialStep={3}>
                            <SelectSignInOption
                                signInOptions={SignInOptions}
                                optionOnClick={this.clickSignIn}
                                clickedSignInOption={this.state.clickedSignInOption}
                            />
                            <SetBrianKey generateBrianKey={this.props.authStore.generateBrianKey} />
                            <SetPassword setPasswordForm={this.props.authStore.choosePassword} />
                        </StepWizard>

                        <div className={'modal-footer'}>
                            {this.renderRememberOption()}
                            {this.renderButtons()}
                        </div>
                    </>
                )}
            </Modal>
        )
    }
}


export default SignInModal as any
