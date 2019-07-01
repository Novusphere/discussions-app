import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'
import { Form } from '@components'

interface INewPageProps {
    postsStore: IStores['postsStore']
}

@inject('postsStore')
@observer
class NewPage extends React.Component<INewPageProps> {
    public render(): React.ReactNode {
        const { newPostForm } = this.props.postsStore
        return (
            <>
                <Form form={newPostForm} />
            </>
        )
    }
}

export default NewPage
