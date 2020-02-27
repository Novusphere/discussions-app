import React, { FunctionComponent, useCallback, useState } from 'react'
import cx from 'classnames'
import styles from './Sorter.module.scss'
import { SORTER_OPTIONS } from '@utils'

interface ISorterProps {
    value: SORTER_OPTIONS
    onChange: (value: SORTER_OPTIONS) => void
}

const Sorter: FunctionComponent<ISorterProps> = ({ onChange, value }) => {
    const onClick = useCallback((option: SORTER_OPTIONS) => {
        onChange(option)
    }, [])

    return (
        <div className={'flex flex-row items-center justify-end mb3'}>
            {Object.keys(SORTER_OPTIONS).map((OPTION: SORTER_OPTIONS) => {
                return (
                    <span
                        onClick={() => onClick(OPTION)}
                        className={cx([
                            'ml2 br2 db f7 ttu pv1 ph2 pointer dim',
                            {
                                'bg-white light-silver': value !== OPTION,
                                'bg-primary white': value === OPTION,
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
    value: 'popular',
}

export default Sorter
