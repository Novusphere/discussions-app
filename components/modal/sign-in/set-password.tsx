import * as React from 'react'
import CreateForm from '../../create-form/create-form'
import { Form } from '@components'

interface ISetPasswordProps {
    setPasswordForm: CreateForm
}

const SetPassword: React.FC<ISetPasswordProps> = ({ setPasswordForm }) => (
    <div className={'flex flex-column items-center justify-center'}>
        <Form form={setPasswordForm} hideSubmitButton className={'w-50-l w-100-s'} />
    </div>
)

export default SetPassword
