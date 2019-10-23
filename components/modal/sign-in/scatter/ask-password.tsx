import * as React from 'react'
import { Form, CreateForm } from '@components'
import { observer } from 'mobx-react'

interface IAskPasswordProps {
    form: CreateForm
}

const ScatterAskForPassword: React.FC<IAskPasswordProps> = ({ form }) => (
    <div className={'flex flex-column items-center justify-center'}>
        <span className={'black f2 b db'}>We need you to enter your password</span>
        <span className={'f5 db mt2'}>
            We encrypt your keys on the chain, so we need your password that you set to decrypt it.
        </span>
        <Form form={form} hideSubmitButton className={'mt4 w-70-l w-100-s'} />
    </div>
)

export default observer(ScatterAskForPassword)
