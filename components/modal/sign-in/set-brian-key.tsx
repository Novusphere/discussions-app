import * as React from 'react'
import { BrianKey } from '@components'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { observer } from 'mobx-react'

interface ISetBrianKeyProps {
    generateBrianKey: any
}

const SetBrianKey: React.FC<ISetBrianKeyProps> = ({ generateBrianKey }) => (
    <div className={'tc ph2 mv3 flex flex-column items-center'}>
        <span className={'black f2 b db'}>Generate a Brian Key</span>
        <span className={'f5 db mt2'}>
            We now require you to generate a brian key with your wallet
        </span>

        <div className={'mt4 pb4 w-50-l w-100-s flex flex-column items-center justify-center'}>
            {generateBrianKey['pending'] && <FontAwesomeIcon size={'10x'} icon={faSpinner} spin />}
            {generateBrianKey['result'] ? (
                <>
                    <BrianKey
                        results={generateBrianKey['result'].split(' ')}
                        className={'flex flex-wrap'}
                    />
                    <span className={'mt2'}>Please note down this key</span>
                </>
            ) : null}
        </div>
    </div>
)

export default observer(SetBrianKey)
