import * as React from 'react'
import { inject, observer, useObserver } from 'mobx-react'
import { IStores } from '@stores'
import { Form, TagDropdown } from '@components'
import NewPostPreview from './new-post-preview/new-post-preview'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { observable } from 'mobx'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

interface INewPageProps {
    postsStore: IStores['postsStore']
    uiStore: IStores['uiStore']
}

// @inject('postsStore', 'uiStore')
// @observer
// class NewPage extends React.Component<INewPageProps> {
//     @observable newPostForm = null
//
//     static async getInitialProps({ store }) {
//         const uiStore: IStores['uiStore'] = store.uiStore
//         const tagStore: IStores['tagStore'] = store.tagStore
//         uiStore.toggleBannerStatus(true)
//         uiStore.toggleSidebarStatus(false)
//         tagStore.destroyActiveTag()
//         return {}
//     }
//
//     componentDidMount(): void {
//         this.newPostForm = this.props.postsStore.newPostForm
//     }
//
//     componentWillUnmount(): void {
//         this.props.postsStore.clearPreview()
//     }
//
//     private onChange = option => {
//         const { form } = this.newPostForm
//
//         const cached = {
//             title: form.$('title').value || '',
//             content: form.$('content').value || '',
//         }
//
//         this.props.postsStore.newPostData.sub = option
//
//         form.$('title').value = cached.title
//         form.$('content').value = cached.content
//     }
//
//     public render(): React.ReactNode {
//         const { subFields, newPostData } = this.props.postsStore
//         const { newPostForm } = this
//
//         if (!newPostForm) return <FontAwesomeIcon width={13} icon={faSpinner} spin />
//
//         return (
//             <>
//                 <div className={'flex flex-row items-center mb3'}>
//                     <span className={'w-20 black f4 b'}>Create a post in</span>
//                     <TagDropdown
//                         formatCreateLabel={inputValue => `Make a new post in #${inputValue}`}
//                         onChange={this.onChange}
//                         className={'w-80'}
//                         value={newPostData.sub}
//                         options={subFields.extra.options}
//                     />
//                 </div>
//                 <div className={'card pa4'}>
//                     <Form form={newPostForm} hideSubmitButton />
//                     <div className={'pv3'}>
//                         <NewPostPreview />
//                     </div>
//                 </div>
//             </>
//         )
//     }
// }

const NewPage = ({ postsStore }) => {
    const [form, setForm] = useState(null)
    const { subFields, newPostData } = postsStore

    useEffect(() => {
        setForm(postsStore.newPostForm)
        return () => {
            postsStore.clearPreview()
        }
    }, [])

    const onChange = useCallback(
        option => {
            if (!form) return

            const cached = {
                title: form.form.$('title').value || '',
                content: form.form.$('content').value || '',
            }

            postsStore.newPostData.sub = option

            // set form again
            const _form = postsStore.newPostForm
            _form.form.$('title').set('value', cached.title)
            _form.form.$('content').set('value', cached.content)

            setForm(_form)
        },
        [form]
    )

    return useObserver(() => {
        if (!form) return <FontAwesomeIcon width={13} icon={faSpinner} spin />
        return (
            <>
                <div className={'flex flex-row items-center mb3'}>
                    <span className={'w-20 black f4 b'}>Create a post in</span>
                    <TagDropdown
                        formatCreateLabel={inputValue => `Make a new post in #${inputValue}`}
                        onChange={onChange}
                        className={'w-80'}
                        value={newPostData.sub}
                        options={subFields.extra.options}
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
    })
}
;(NewPage as any).getInitialProps = async ({ store }) => {
    const uiStore: IStores['uiStore'] = store.uiStore
    const tagStore: IStores['tagStore'] = store.tagStore

    uiStore.toggleBannerStatus(true)
    uiStore.toggleSidebarStatus(false)
    tagStore.destroyActiveTag()

    return {}
}

export default inject('postsStore')(NewPage)
