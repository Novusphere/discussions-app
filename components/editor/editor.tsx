import * as React from 'react'
import { Editor as ReactDraftEditor } from 'react-draft-wysiwyg'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { EditorState, convertToRaw } from 'draft-js'
import draftToMarkdown from 'draftjs-to-markdown'
import classNames from 'classnames'

interface IEditorProps {
    onChange: (html: any) => void // passed in via spread (bind) in form.tsx
    placeholder: string
    className?: string
}

// https://jpuri.github.io/react-draft-wysiwyg/#/docs
class Editor extends React.Component<IEditorProps> {
    state = {
        mounted: false, // https://github.com/jpuri/react-draft-wysiwyg/issues/660
        editorState: EditorState.createEmpty(),
    }

    private onContentStateChange = () => {
        const content = draftToMarkdown(convertToRaw(this.state.editorState.getCurrentContent()))
        console.log(content)
        this.props.onChange(content)
    }

    private onEditorStateChange = editorState => {
        this.setState({
            editorState,
        })
    }

    componentDidMount(): void {
        this.setState({
            mounted: true,
        })
    }

    public render(): React.ReactNode {
        if (!this.state.mounted) {
            return <FontAwesomeIcon icon={faSpinner} spin className={'w-10'} />
        }

        const { placeholder, className, ...rest } = this.props

        return (
            <>
                <ReactDraftEditor
                    {...rest}
                    placeholder={placeholder}
                    editorState={this.state.editorState}
                    onEditorStateChange={this.onEditorStateChange}
                    onChange={this.onContentStateChange}
                    editorClassName={'editor-content'}
                    wrapperClassName={classNames([
                        'editor-wrapper',
                        {
                            [className]: !!className,
                        },
                    ])}
                    toolbarClassName={'editor-toolbar'}
                    toolbar={{
                        options: ['inline', 'blockType', 'link', 'image', 'emoji'],
                    }}
                />
            </>
        )
    }
}

export default Editor
