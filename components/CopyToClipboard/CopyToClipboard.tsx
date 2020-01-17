import * as React from 'react'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import './style.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import copy from 'clipboard-copy'

interface ICopyToClipboardProps {
    label: string
    value: string
}

const CopyToClipboard: React.FC<ICopyToClipboardProps> = ({ label, value }) => (
    <div className={'field-container pb3 inline-labels relative'}>
        <label className={'w-40'}>{label}</label>
        <input
            value={value}
            disabled={true}
            className={'db f6 form-input'}
            style={{ paddingRight: '3em' }}
        />
        <span
            className={'pointer absolute right-0 copy-btn'}
            title={'Copy to clipboard'}
            onClick={() => copy(value)}
        >
            <FontAwesomeIcon width={13} icon={faCopy} />
        </span>
    </div>
)

export default CopyToClipboard
