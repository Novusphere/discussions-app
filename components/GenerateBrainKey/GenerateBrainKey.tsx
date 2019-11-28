import * as React from 'react'
import { observer } from 'mobx-react'
import classNames from 'classnames'

interface IGeneratedKeyProps {
    results: string[]
    className?: string
}

const GenerateBrainKey: React.FC<IGeneratedKeyProps> = ({ results, className }) => (
    <>
        <span
            className={classNames([
                'flex flex-wrap',
                {
                    [className]: typeof className !== 'undefined',
                },
            ])}
        >
            {results.map((result, index) => (
                <span key={result} className={'b f5 pa2 dark-gray ba b--black-10 mr3 mb3 mw3'}>
                    <span className={'f6 o-50 db'}>{index + 1}</span>
                    {result}
                </span>
            ))}
        </span>
    </>
)

export default observer(GenerateBrainKey)
