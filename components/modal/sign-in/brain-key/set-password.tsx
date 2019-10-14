import * as React from 'react'
import { Form, CreateForm } from '@components'

interface ISetPasswordProps {
    form: CreateForm
}

const SetPassword: React.FC<ISetPasswordProps> = ({ form }) => (
    <div className={'flex flex-column items-center justify-center'}>
        <span className={'black f2 b db'}>Enter your password</span>
        <span className={'f5 db mt2'}>
            Enter your password to decrypt your keys and log in to EOS Discussions app.
        </span>
        <Form hideSubmitButton form={form} className={'w-80-l w-100-s db tc mt2'} />
    </div>
)

export default SetPassword as any
