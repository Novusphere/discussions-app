import * as React from 'react'
import { observer } from 'mobx-react'

interface IGeneratedKeyProps {
    results: string[]
}

const GeneratedKey: React.FC<IGeneratedKeyProps> = ({ results }) => (
    <>
        <span className={'b f6 black lh-copy db mb3'}>Memorize it!</span>
        <span className={'flex flex-wrap'}>
            {results.map((result, index) => (
                <span key={result} className={'b f5 pa2 dark-gray ba b--black-10 mr3 mb3 mw3'}>
                    <span className={'f6 o-50 db'}>{index + 1}</span>
                    {result}
                </span>
            ))}
        </span>
    </>
)

export default observer(GeneratedKey)
