import * as React from 'react'
import Creatable from 'react-select/creatable'
import classNames from 'classnames'

import './style.scss'

interface ITagDropdownProps {
    formatCreateLabel: (value: string) => string
    onChange: (option: any) => void
    className?: string
    classNamePrefix?: string
    value: string
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
    return (
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
    )
}

export default TagDropdown
