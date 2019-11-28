import * as React from 'react'
import { GenerateBrainKey, SectionHeader } from '@components'
import { Collapse } from '@components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { observer } from 'mobx-react'

interface IGenerateKeyProps {
    currentStep: number
    generateBrianKey: any
    onHeaderClick: () => void
    className?: string
}

const GenerateKey: React.FC<IGenerateKeyProps> = ({
    currentStep,
    generateBrianKey,
    onHeaderClick,
}) => (
    <>
        <SectionHeader
            currentStep={currentStep}
            header={'2. Generate a brain key'}
            onClick={onHeaderClick}
        />

        <>
            <Collapse
                isOpened={currentStep === 2}
                springConfig={{
                    stiffness: 210,
                    damping: 20,
                }}
            >
                <div className={'mv2 field-container w-50'}>
                    <span className={'b f6 black lh-copy db mb2 enable-user-select'}>
                        The Brainkey is the seed phrase from which your public-private key pairs are
                        generated. You can restore the public-private key pairs from your Brainkey
                        if you lose the keys. The Brainkey itself cannot be restored once lost!
                    </span>

                    {generateBrianKey['result'] ? (
                        <GenerateBrainKey results={generateBrianKey['result'].split(' ')} />
                    ) : (
                        <button
                            disabled={generateBrianKey['pending']}
                            className={'mt3 f6 link dim ph3 pv2 dib mr2 pointer white bg-green'}
                            onClick={async () => {
                                try {
                                    await generateBrianKey()
                                } catch (error) {
                                    console.log(error)
                                }
                            }}
                        >
                            {generateBrianKey['pending'] ? (
                                <FontAwesomeIcon width={13} icon={faSpinner} spin />
                            ) : (
                                'Generate'
                            )}
                        </button>
                    )}
                </div>
            </Collapse>
        </>
    </>
)

export default observer(GenerateKey)
