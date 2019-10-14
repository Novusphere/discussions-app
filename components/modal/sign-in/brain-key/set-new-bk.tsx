import * as React from 'react'
import { Form, CreateForm } from '@components'

interface ISetPasswordProps {
    form: CreateForm
}

const SetNewBK: React.FC<ISetPasswordProps> = ({ form }) => (
    <div className={'flex flex-column items-center justify-center'}>
        <span className={'black f2 b db'}>Enter your BK and password</span>
        <span className={'f5 db mt2 w-70 tc'}>
            Enter your brain key, display name and password. Once successful, we will use this
            account by default the next time you click "Sign in with BK".
        </span>
        <Form hideSubmitButton form={form} className={'w-80-l w-100-s db tc mt3'} />
    </div>
)

export default SetNewBK as any
