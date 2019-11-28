import * as React from 'react'
import { SectionHeader, Form, CreateForm } from '@components'
import { Collapse } from '@components'
import { observer } from 'mobx-react'

interface IChooseAccountNameProps {
    form: CreateForm
    currentStep: number
    onHeaderClick: () => void
}

const ChooseAccountName: React.FC<IChooseAccountNameProps> = ({
    form,
    currentStep,
    onHeaderClick,
}) => (
    <>
        <SectionHeader
            currentStep={currentStep}
            header={'1. Setup an account name and password'}
            onClick={onHeaderClick}
        />

        <Collapse isOpened={currentStep === 1}>
            <Form form={form} hideSubmitButton />
        </Collapse>
    </>
)

export default observer(ChooseAccountName)
