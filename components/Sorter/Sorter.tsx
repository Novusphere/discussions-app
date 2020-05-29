import React, { FunctionComponent, useCallback } from 'react'
import cx from 'classnames'
import styles from './Sorter.module.scss'
import { SORTER_OPTIONS } from '@utils'
import { useMediaQuery } from 'react-responsive'

interface ISorterProps {
    value: string
    onChange: (value: string) => void
}

const Sorter: FunctionComponent<ISorterProps> = ({ onChange, value }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 })

    const onClick = useCallback((option: string) => {
        onChange(option)
    }, [])

    return (
        <div
            className={cx([
                'flex flex-row items-center justify-end mb3',
                {
                    mt3: isMobile,
                    ph2: isMobile,
                },
            ])}
        >
            {Object.keys(SORTER_OPTIONS).map((OPTION: string) => {
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
