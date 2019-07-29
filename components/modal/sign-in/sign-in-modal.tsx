import * as React from 'react'
import { Modal, SelectSignInOption } from '@components'
import { IStores } from '@stores'
import { observer, inject } from 'mobx-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { SignInMethods } from '@globals'
import StepWizard from 'react-step-wizard'
import { SignInOptions } from '../../../constants/sign-in-options'

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

    renderButtons = () => {
        const { signInViaWallet } = this.props.authStore

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
                        onClick={signInViaWallet}
                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                        disabled={!this.state.clickedSignInOption || signInViaWallet['pending']}
                    >
                        {signInViaWallet['pending'] ? (
                            <FontAwesomeIcon width={13} icon={faSpinner} spin />
                        ) : (
                            'Sign in via Scatter'
                        )}
                    </button>
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

                        <StepWizard>
                            <SelectSignInOption
                                signInOptions={SignInOptions}
                                optionOnClick={this.clickSignIn}
                                clickedSignInOption={this.state.clickedSignInOption}
                            />
                        </StepWizard>

                        <div className={'modal-footer'}>
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
                            <div>{this.renderButtons()}</div>
                        </div>
                    </>
                )}
            </Modal>
        )
    }
}


export default SignInModal as any
