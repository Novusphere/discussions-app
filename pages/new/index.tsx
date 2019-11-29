import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { Form } from '@components'
import NewPostPreview from './new-post-preview/new-post-preview'
import Creatable from 'react-select/creatable'

interface INewPageProps {
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
}

@inject('postsStore', 'uiStore')
@observer
class NewPage extends React.Component<INewPageProps> {
    static async getInitialProps({ store }) {
        const uiStore: IStores['uiStore'] = store.uiStore
        const tagStore: IStores['tagStore'] = store.tagStore
        uiStore.toggleBannerStatus(true)
        uiStore.toggleSidebarStatus(false)
        tagStore.destroyActiveTag()
        return {}
    }

    componentWillUnmount(): void {
        this.props.postsStore.clearPreview()
    }

    private onChange = option => {
        const cached = {
            title: this.props.postsStore.newPostForm.form.$('title').value || '',
            content: this.props.postsStore.newPostForm.form.$('content').value || '',
        }
        
        this.props.postsStore.newPostData.sub = option
        this.props.postsStore.newPostForm.form.$('title').value = cached.title
        this.props.postsStore.newPostForm.form.$('content').value = cached.content
    }

    public render(): React.ReactNode {
        const { subFields, newPostData } = this.props.postsStore

        return (
            <>
                <div className={'flex flex-row items-center mb3'}>
                    <span className={'w-20 black f4 b'}>Create a post in</span>
                    <Creatable
                        formatCreateLabel={inputValue => `Make a new post in #${inputValue}`}
                        onChange={this.onChange}
                        className={'w-80 db f6 react-select-dropdown'}
                        classNamePrefix={'rs'}
                        value={newPostData.sub}
                        options={subFields.extra.options}
                    />
                </div>
                <div className={'card pa4'}>
                    <Form form={this.props.postsStore.newPostForm} hideSubmitButton />
                    <div className={'pv3'}>
                        <NewPostPreview />
                    </div>
                </div>
            </>
        )
    }
}

export default NewPage
