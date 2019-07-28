import * as React from 'react'
import { Modal } from '@components'
import { IStores } from '@stores'
import { observer, inject } from 'mobx-react'
import { SignInOptions } from '../../../constants/sign-in-options'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

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
            case 'EOS Wallet':
                return (
                    <button
                        onClick={signInViaWallet}
                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                        disabled={!this.state.clickedSignInOption || signInViaWallet['pending']}
                    >
                        {signInViaWallet['pending'] ? (
                            <FontAwesomeIcon width={13} icon={faSpinner} spin />
                        ) : (
                            'Sign in via EOS Wallet'
                        )}
                    </button>
                )
            case 'Brian Key':
                return (
                    <button
                        className={'f6 link dim ph3 pv2 dib pointer white bg-green'}
                        disabled={!this.state.clickedSignInOption}
                    >
                        Sign in via Brian Key
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

                        <div className={'tc ph2 mv3'}>
                            <span className={'black f2 b db'}>Sign in with your EOS account</span>
                            <span className={'f5 b db mt2'}>
                                Choose an account type from below to continue!
                            </span>
                        </div>

                        <div
                            className={
                                'mt3 pb5 ph5-l ph2-m ph0-s flex flex-column items-center justify-center'
                            }
                        >
                            <div
                                className={
                                    'w-80-l w-100-s flex flex-wrap items-center justify-center'
                                }
                            >
                                {SignInOptions.map(option => (
                                    <span
                                        title={`Toggle ${option.name} sign in`}
                                        onClick={() => this.clickSignIn(option.name)}
                                        key={option.name}
                                        className={classNames([
                                            'w-40 ba b--black-10 br4 mr2 pa2 tc pointer f2',
                                            {
                                                'bg-green white':
                                                    this.state.clickedSignInOption === option.name,
                                            },
                                        ])}
                                    >
                                        <FontAwesomeIcon icon={option.icon} className={'db'} />
                                        <span className={'mt2 db f5'}>{option.name}</span>
                                    </span>
                                ))}
                            </div>

                            <span className={'f5 b mt3'}>
                                Don't have one? <a>Create an account for free.</a>
                            </span>
                        </div>

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
