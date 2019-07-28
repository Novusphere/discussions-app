import * as React from 'react'
import { SignInModalSectionHeader, Collapse } from '@components'
import { presets } from 'react-motion'

interface IVerificationProps {
    currentStep: number
    onHeaderClick: () => void
    generateBrianKey: any
}

const Verification: React.FC<IVerificationProps> = ({
    currentStep,
    onHeaderClick,
    generateBrianKey,
}) => (
    <>
        <SignInModalSectionHeader
            currentStep={currentStep}
            header={'3. Verification'}
            onClick={onHeaderClick}
        />

        <Collapse isOpened={currentStep === 3} springConfig={presets.stiff}>
            <div className={'mv2 field-container w-50'}>
                <span className={'b f6 black lh-copy db mb3'}>
                    {generateBrianKey['result']
                        ? 'Re-type your key with each word separated by a space.'
                        : 'Generate a brian key first!'}
                </span>
                {generateBrianKey['result'] && (
                    <textarea className={'db w-100'} placeholder={'Enter your brian key words'} />
                )}
            </div>
        </Collapse>
    </>
)


export default Verification
