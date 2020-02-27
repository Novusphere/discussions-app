import React, { FunctionComponent, useCallback, useState } from 'react'
import cx from 'classnames'
import styles from './Sorter.module.scss'
import { SORTER_OPTIONS } from '@utils'

interface ISorterProps {
    value: SORTER_OPTIONS
    onChange: (value: SORTER_OPTIONS) => void
}

const Sorter: FunctionComponent<ISorterProps> = ({ onChange, value }) => {
    const [currentOption, setOption] = useState(value)
    const onClick = useCallback(
        (option: SORTER_OPTIONS) => {
            console.log('setitng option: ', option)
            setOption(SORTER_OPTIONS[option])
            onChange(option)
        },
        [currentOption]
    )

    console.log(currentOption)

    return (
        <div className={'flex flex-row items-center justify-end mb3'}>
            {Object.keys(SORTER_OPTIONS).map((OPTION: SORTER_OPTIONS) => {
                return (
                    <span
                        onClick={() => onClick(OPTION)}
                        className={cx([
                            'ml2 br3 db f6 pv2 ph3 pointer',
                            {
                                'bg-near-white dark-gray': currentOption !== SORTER_OPTIONS[OPTION],
                                'bg-primary white': currentOption === SORTER_OPTIONS[OPTION],
                            },
                        ])}
                        key={OPTION}
                    >
                        {SORTER_OPTIONS[OPTION]}
                    </span>
                )
            })}
        </div>
    )
}

Sorter.defaultProps = {
    value: SORTER_OPTIONS.popular,
}

export default Sorter
