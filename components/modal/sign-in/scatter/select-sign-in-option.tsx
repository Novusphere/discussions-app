import * as React from 'react'
import { SignInOptions } from '@constants/sign-in-options'
import classNames from 'classnames'
import { StepProps } from '@d.ts/declarations'
import { observer } from 'mobx-react'

interface ISelectSignInOptionProps extends StepProps {
    signInOptions: typeof SignInOptions
    clickedSignInOption: string
    optionOnClick: (name: string) => void
}

const SelectSignInOption: React.FC<ISelectSignInOptionProps> = ({
    signInOptions,
    optionOnClick,
    clickedSignInOption,
}) => (
    <>
        <div className={'tc ph2 mv3'}>
            <span className={'black f2 b db'}>Sign in with your EOS account</span>
            <span className={'f5 db mt2'}>Choose an account type from below to continue</span>
        </div>

        <div className={'mt3 pb5 ph5-l ph2-m ph0-s flex flex-column items-center justify-center'}>
            <div className={'w-80-l w-100-s flex flex-wrap items-center justify-center'}>
                {signInOptions.map(option => (
                    <span
                        title={`Toggle ${option.name} sign in`}
                        onClick={() => optionOnClick(option.name)}
                        key={option.name}
                        className={classNames([
                            'w-40 ba b--black-10 br4 mr2 pa2 tc pointer f2',
                            {
                                'bg-green white': clickedSignInOption === option.name,
                            },
                        ])}
                    >
                        <img src={option.icon} className={'db'} alt={`Login via ${option.name}`} />
                        <span className={'mt2 db f5'}>{option.name}</span>
                    </span>
                ))}
            </div>

            <span className={'f5 b mt3'}>
                Don't have one? <a>Create an account for free.</a>
            </span>
        </div>
    </>
)

export default observer(SelectSignInOption)
