import * as React from 'react'

interface ISuccessSetupProps {}

const SuccessSetup: React.FC<ISuccessSetupProps> = () => (
    <div className={'flex flex-column items-center justify-center mb3'}>
        <span className={'black f2 b db'}>Success!</span>
        <span className={'f5 db mt2'}>You have setup your account!</span>
    </div>
)

export default SuccessSetup
