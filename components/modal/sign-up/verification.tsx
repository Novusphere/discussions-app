import * as React from 'react'
import { SectionHeader, Collapse, Form } from '@components'
import { presets } from 'react-motion'
import CreateForm from '../../create-form/create-form'

interface IVerificationProps {
    form: CreateForm
    currentStep: number
    onHeaderClick: () => void
}

const Verification: React.FC<IVerificationProps> = ({
    form,
    currentStep,
    onHeaderClick,
}) => (
    <>
        <SectionHeader
            currentStep={currentStep}
            header={'3. Verify your brain key'}
            onClick={onHeaderClick}
        />

        <Collapse isOpened={currentStep === 3} springConfig={presets.stiff}>
            <Form form={form} hideSubmitButton />
        </Collapse>
    </>
)


export default Verification
