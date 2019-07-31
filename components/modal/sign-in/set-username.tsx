import * as React from 'react'
import CreateForm from '../../create-form/create-form'
import { Form } from '@components'

interface ISetUsernameProps {
    setUsernameForm: CreateForm
}

const SetUsername: React.FC<ISetUsernameProps> = ({ setUsernameForm }) => (
    <div className={'flex flex-column items-center justify-center'}>
        <span className={'black f2 b db'}>Set a username</span>
        <span className={'f5 db mt2'}>
            On discussions app, you can choose to set a display name on the forum.
        </span>
        <Form form={setUsernameForm} hideSubmitButton className={'mt4 w-70-l w-100-s'} />
    </div>
)

export default SetUsername
