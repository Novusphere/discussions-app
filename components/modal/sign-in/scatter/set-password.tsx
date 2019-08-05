import * as React from 'react'
import { Form, CreateForm } from '@components'
import { observer } from 'mobx-react'

interface ISetPasswordProps {
    setPasswordForm: CreateForm
}

const SetPassword: React.FC<ISetPasswordProps> = ({ setPasswordForm }) => (
    <div className={'flex flex-column items-center justify-center'}>
        <span className={'black f2 b db'}>Choose a password</span>
        <span className={'f5 db mt2'}>
            We encrypt your keys on the chain, so we need a password that you set to decrypt it.
        </span>
        <Form form={setPasswordForm} hideSubmitButton className={'mt4 w-70-l w-100-s'} />
    </div>
)

export default observer(SetPassword)
