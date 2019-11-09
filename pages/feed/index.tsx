import * as React from 'react'
import { observer, inject } from 'mobx-react'

import './style.scss'
import ComingSoonMessage from '../../components/coming-soon-message/coming-soon-message'

interface IIndexProps {}

interface IIndexState {}

class Index extends React.Component<IIndexProps, IIndexState> {
    public render() {
        return (
            <div className={'h-100 w-100 relative'}>
                <ComingSoonMessage />
            </div>
        )
    }
}

export default Index
