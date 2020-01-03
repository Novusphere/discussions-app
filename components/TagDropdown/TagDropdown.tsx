import * as React from 'react'
import Creatable from 'react-select/creatable'
import classNames from 'classnames'

import './style.scss'
import { useObserver } from 'mobx-react-lite'

interface ITagDropdownProps {
    formatCreateLabel: (value: string) => string
    onChange: (option: any) => void
    className?: string
    classNamePrefix?: string
    value: { value: string, label: string }
    options: any[]
}

const TagDropdown: React.FC<ITagDropdownProps> = ({
    formatCreateLabel,
    onChange,
    className,
    classNamePrefix = 'rs',
    value,
    options,
}) => {
    return useObserver(() => (
        <Creatable
            formatCreateLabel={formatCreateLabel}
            onChange={onChange}
            className={classNames([
                className,
                {
                    [className]: !!className,
                },
            ])}
            classNamePrefix={classNamePrefix}
            value={value}
            options={options}
        />
    ))
}

export default TagDropdown
