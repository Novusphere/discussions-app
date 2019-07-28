import * as React from 'react'
import classNames from 'classnames'

interface ISignInModalHeader {
    header: string
    onClick: () => void
    currentStep: number
}

const SignInModalHeader: React.FC<ISignInModalHeader> = ({ header, currentStep, ...props }) => {
    let [step] = header as any
    step = Number(step)
    return React.createElement(
        'span',
        {
            className: classNames([
                'b f4 black db pointer link hover-near-black',
                {
                    'o-100': currentStep === step,
                    'light-silver': currentStep !== step,
                },
            ]),
            ...props,
        },
        [
            header,
            <span
                key={'ornament'}
                className={classNames([
                    'mt2 mb3 db bb-ornament',
                    {
                        'o-100': currentStep === step,
                        'o-50': currentStep !== step,
                    },
                ])}
            />,
        ]
    )
}



export default SignInModalHeader
