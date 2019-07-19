import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import dynamic from 'next/dynamic'

interface IEditorProps {
    authStore?: IStores['authStore']
    onChange: (html: any) => void // passed in via spread (bind) in form.tsx
    placeholder: string
    className?: string
}

const Quill = dynamic(import('react-quill'), {
    ssr: false,
    loading: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
})

// https://jpuri.github.io/react-draft-wysiwyg/#/docs
@inject('authStore')
@observer
class Editor extends React.Component<IEditorProps> {
    state = {
        text: ''
    }

    onChange = (text) => {
        this.setState({
            text,
        })
    }

    public render(): React.ReactNode {
        return (
            <Quill
                value={this.state.text}
                onChange={this.onChange}
            />
        )
    }
}

export default Editor
