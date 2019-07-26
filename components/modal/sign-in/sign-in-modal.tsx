import * as React from 'react'
import { Modal } from '@components'
import classNames from 'classnames'
import { Collapse } from 'react-collapse'
import { observer, inject } from 'mobx-react'
import { IStores } from '@stores'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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

    private renderHeader = (header: string, props: any) => {
        let [step] = header as any
        step = Number(step)
        return React.createElement(
            'span',
            {
                className: classNames([
                    'b f4 black db pointer link hover-near-black',
                    {
                        'o-100': this.state.currentStep === step,
                        'light-silver': this.state.currentStep !== step,
                    },
                ]),
                ...props,
            },
            [
                header,
                <span
                    key={'ornament'}
                    className={classNames([
                        'mt2 mb3 db bb-ornament',
                        {
                            'o-100': this.state.currentStep === step,
                            'o-50': this.state.currentStep !== step,
                        },
                    ])}
                />,
            ]
        )
    }

    private renderChooseAccountName = () => (
        <>
            {this.renderHeader('1. Choose An Account Name', {
                onClick: () => this.setStep(1),
            })}

            <Collapse isOpened={this.state.currentStep === 1}>
                <div className={'mv2 field-container w-50'}>
                    <span className={'b ttu f6 black tracked-tight db mb2'}>Name</span>
                    <input className={'db w-100'} placeholder={'Enter an account name'} />
                    <span className={'hint pt2 db'}>
                        must be 12 characters, lowercase, and only numerals 1-5 allowed
                    </span>
                </div>
            </Collapse>
        </>
    )

    private renderGeneratedKey = () => {
        const { generateBrianKey } = this.props.authStore
        const results = generateBrianKey['result'].split(' ')

        return (
            <>
                <span className={'b f6 black lh-copy db mb3'}>Memorize it!</span>
                <span className={'flex flex-wrap'}>
                    {results.map((result, index) => (
                        <span
                            key={result}
                            className={'b f5 pa2 dark-gray ba b--black-10 mr3 mb3 mw3'}
                        >
                            <span className={'f6 o-50 db'}>{index + 1}</span>
                            {result}
                        </span>
                    ))}
                </span>
                <div className={'flex items-center justify-between'}>
                    <button
                        className={'mt3 f6 link dim br2 ph3 pv2 dib mr2 pointer white bg-green'}
                        onClick={this.goNext}
                    >
                        Verify this key
                    </button>
                </div>
            </>
        )
    }

    private renderGenerateKey = () => {
        const { generateBrianKey } = this.props.authStore

        return (
            <>
                {this.renderHeader('2. Generate A Key', {
                    onClick: () => this.setStep(2),
                })}

                <Collapse
                    isOpened={this.state.currentStep === 2}
                    springConfig={{
                        stiffness: 210,
                        damping: 20,
                    }}
                >
                    <div className={'mv2 field-container w-50'}>
                        <span className={'b f6 black lh-copy db mb2 enable-user-select'}>
                            The Brainkey is the seed phrase from which your public-private key pairs
                            are generated. You can restore the public-private key pairs from your
                            Brainkey if you lose the keys. The Brainkey itself cannot be restored
                            once lost!
                        </span>

                        {generateBrianKey['result'] ? (
                            this.renderGeneratedKey()
                        ) : (
                            <button
                                disabled={generateBrianKey['pending']}
                                className={
                                    'mt3 f6 link dim br2 ph3 pv2 dib mr2 pointer white bg-green'
                                }
                                onClick={async () => {
                                    try {
                                        await generateBrianKey()
                                        // this.goNext()
                                    } catch (error) {
                                        console.log(error)
                                    }
                                }}
                            >
                                {generateBrianKey['pending'] ? (
                                    <FontAwesomeIcon width={13} icon={faSpinner} spin />
                                ) : (
                                    'Generate'
                                )}
                            </button>
                        )}
                    </div>
                </Collapse>
            </>
        )
    }

    private renderVerification = () => (
        <>
            {this.renderHeader('3. Verification', {
                onClick: () => this.setStep(3),
            })}

            <Collapse isOpened={this.state.currentStep === 3}>
                <div className={'mv2 field-container w-50'}>
                    <span className={'b f6 black lh-copy db mb3'}>
                        Re-type your key with each word separated by a space.
                    </span>
                    <textarea className={'db w-100'} placeholder={'Enter your brian key words'} />

                    <div className={'flex items-center justify-start'}>
                        <button
                            className={
                                'mt3 f6 link dim br2 ph3 pv2 dib mr2 pointer white bg-near-black'
                            }
                            onClick={this.goBack}
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </Collapse>
        </>
    )

    public render() {
        return (
            <Modal>
                {({ CloseIcon }) => (
                    <>
                        <div className={'flex items-center justify-end'}>
                            <CloseIcon />
                        </div>
                        <div className={'modal-body'}>
                            {this.renderChooseAccountName()}
                            <div className={'mt2'}>{this.renderGenerateKey()}</div>
                            <div className={'mt3'}>{this.renderVerification()}</div>
                        </div>
                        <div className={'modal-footer'}>
                            <button
                                className={
                                    'mt3 f6 link dim br2 ph3 pv2 dib mr2 pointer white bg-green'
                                }
                                onClick={() => console.log('finish!')}
                            >
                                Continue
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        )
    }
}

export default SignInModal
