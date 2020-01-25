import * as React from 'react'
import { inject, observer, useObserver } from 'mobx-react'
import { IStores } from '@stores'
import { Form, TagDropdown } from '@components'
import NewPostPreview from './new-post-preview/new-post-preview'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { sanityCheckTag } from '@utils'

interface INewPageProps {
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
}

interface INewPageState {
    form: any
}

@inject('postsStore', 'uiStore')
@observer
class NewPage extends React.Component<INewPageProps, INewPageState> {
    constructor(props) {
        super(props)

        this.state = {
            form: props.postsStore.newPostForm,
        }
    }

    componentDidMount(): void {
        this.props.uiStore.toggleSidebarStatus(false)
    }

    private onChange = option => {
        const {
            postsStore: { newPostData, newPostForm },
        } = this.props
        const { form } = this.state

        if (!form) return

        const cached = {
            title: form.form.$('title').value || '',
            content: form.form.$('content').value || '',
        }

        newPostData.sub = {
            label: `#${sanityCheckTag(option.label)}`,
            value: sanityCheckTag(option.value),
        }

        // set form again
        const _form = newPostForm
        _form.form.$('title').set('value', cached.title)
        _form.form.$('content').set('value', cached.content)

        this.setState({
            form: _form,
        })
    }

    render() {
        const {
            postsStore: { subFields, newPostData },
        } = this.props
        const { form } = this.state

        if (!form) return <FontAwesomeIcon width={13} icon={faSpinner} spin />

        return (
            <>
                <div className={'flex flex-row items-center mb3'}>
                    <span className={'w-20 black f4 b'}>Create a post in</span>
                    <TagDropdown
                        formatCreateLabel={inputValue => `Make a new post in #${inputValue}`}
                        onChange={this.onChange}
                        className={'w-80'}
                        value={newPostData.sub}
                        options={subFields.extra.options}
                        placeholder={'Enter a tag name or pick from one your subscribed below'}
                    />
                </div>
                <div className={'card pa4'}>
                    <Form form={form} hideSubmitButton />
                    <div className={'pv3'}>
                        <NewPostPreview />
                    </div>
                </div>
            </>
        )
    }
}

export default inject('postsStore')(NewPage)
