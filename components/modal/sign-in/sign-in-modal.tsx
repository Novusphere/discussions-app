import * as React from 'react'
import { Modal } from '@components'
import { IStores } from '@stores'
import { observer, inject } from 'mobx-react'
import { SignInOptions } from '../../../constants/sign-in-options'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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

    private clickSignIn = (slug: string) => {
        if (this.state.clickedSignInOption === slug) {
            this.setState({
                clickedSignInOption: '',
            })
        } else {
            this.setState({
                clickedSignInOption: slug,
            })
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
                                        title={`Toggle ${option.slug} sign in`}
                                        onClick={() => this.clickSignIn(option.slug)}
                                        key={option.slug}
                                        className={classNames([
                                            'w-40 ba b--black-10 br4 mr2 pa2 tc pointer f2',
                                            {
                                                'bg-green white':
                                                    this.state.clickedSignInOption === option.slug,
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
                    </>
                )}
            </Modal>
        )
    }
}


export default SignInModal as any
