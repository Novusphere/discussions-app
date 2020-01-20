import * as React from 'react'
import { observer, inject } from 'mobx-react'

import './style.scss'
import { Form, Modal } from '@components'
import { IStores } from '@stores'

interface IWalletActionPasswordReEntryProps {
    settingsStore?: IStores['settingsStore']
}

interface IWalletActionPasswordReEntryState {}

@inject('settingsStore')
@observer
class WalletActionPasswordReEntry extends React.Component<
    IWalletActionPasswordReEntryProps,
    IWalletActionPasswordReEntryState
> {
    public render() {
        const { passwordReEntryForm } = this.props.settingsStore

        return (
            <Modal>
                {({ CloseButton }) => (
                    <>
                        <div className={'modal-header'}>Password Re-entry</div>
                        <div className={'modal-body'}>
                            <span className={'b db mb3'}>
                                Please enter your password to continue with this action.
                            </span>
                            <Form form={passwordReEntryForm} hideSubmitButton />
                        </div>
                        <div className={'modal-footer'}>
                            <CloseButton />
                            <button
                                className="f6 link dim ph3 pv2 dib white bg-green white mr2 pointer"
                                onClick={passwordReEntryForm.onSubmit}
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

export default WalletActionPasswordReEntry
