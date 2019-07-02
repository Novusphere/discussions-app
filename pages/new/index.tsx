import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores/index'
import { Form } from '@components'
import NewPostPreview from './new-post-preview/new-post-preview'

interface INewPageProps {
    postsStore: IStores['postsStore']
}

@inject('postsStore')
@observer
class NewPage extends React.Component<INewPageProps> {
    componentWillUnmount(): void {
        this.props.postsStore.clearPreview()
    }

    public render(): React.ReactNode {
        const { newPostForm } = this.props.postsStore

        return (
            <div className={'card pa4'}>
                <Form form={newPostForm} hideSubmitButton />
                {/*<NewPostPreview />*/}
            </div>
        )
    }
}

export default NewPage
