import * as React from 'react'
import { SignInModalSectionHeader } from '@components'
import { Collapse } from '@components'
import { observer } from 'mobx-react'

interface IChooseAccountNameProps {
    currentStep: number
    onHeaderClick: () => void
}

const ChooseAccountName: React.FC<IChooseAccountNameProps> = ({ currentStep, onHeaderClick }) => (
    <>
        <SignInModalSectionHeader
            currentStep={currentStep}
            header={'1. Choose An Account Name'}
            onClick={onHeaderClick}
        />

        <Collapse isOpened={currentStep === 1}>
            <div className={'mv2 field-container w-50'}>
                <span className={'b ttu f6 black tracked-tight db mb2'}>Name</span>
                <input className={'db w-100'} placeholder={'Enter an account name'} />
                <span className={'hint pt2 db'}>
                    must be 12 characters, lowercase, and only numerals 1-5 allowed
                </span>
            </div>
        </Collapse>
    </>
)

export default observer(ChooseAccountName)
