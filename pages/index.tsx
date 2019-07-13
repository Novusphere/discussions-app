import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Feed } from '@components'
import { IStores } from '@stores'

interface IIndexPage {
    postsStore: IStores['postsStore']
}

@inject('postsStore')
@observer
class Index extends React.Component<IIndexPage> {
    componentWillMount(): void {
        this.props.postsStore.getPostsByTag(['home'])
    }

    public render(): React.ReactNode {
        return <Feed />
    }
}

export default Index
