import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

interface IEditorProps {
    authStore?: IStores['authStore']
    onChange: (html: any) => void // passed in via spread (bind) in form.tsx
    placeholder: string
    className?: string
    value?: any
}

@inject('authStore')
@observer
class Editor extends React.Component<IEditorProps> {
    state = {
        loaded: false,
    }

    public turndownService: any

    private quillBase: any
    private modules: any = null

    async componentDidMount(): Promise<void> {
        /**
         * This is how we get around SSR problems
         * using async imports.
         */
        const quillEditor = await import('react-quill')
        this.quillBase = {
            Editor: quillEditor.default,
            Quill: quillEditor.Quill,
        }

        const mention = await import('quill-mention')
        const Mention = mention.default

        const turndownImport = await import('turndown')
        const Turndown = turndownImport.default

        this.turndownService = new Turndown()

        this.quillBase.Quill.register('modules/mention', Mention)

        this.modules = {
            mention: {
                fixMentionsToQuill: true,
                mentionDenotationChars: ['@'],
                source: async (searchTerm, renderList, mentionChar) => {
                    const accounts = await this.props.authStore.fetchSuggestedAccounts(searchTerm)

                    let values

                    if (mentionChar === '@') {
                        values = accounts
                    } else {
                        values = accounts
                    }

                    if (searchTerm.length === 0) {
                        renderList(values, searchTerm)
                    } else {
                        const matches = []
                        for (let i = 0; i < values.length; i++) {
                            if (~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())) {
                                matches.push(values[i])
                            }
                        }
                        renderList(matches, searchTerm)
                    }
                },
                onSelect: (item, insertItem) => {
                    item.value = `<a href='${window.location.origin + '/u/' + item.value}'>${item.value}</a>`
                    return insertItem(item)
                }
            },
        }

        /**
         * Set loaded to true at the end
         * to ensure our component won't throw errors due to
         * Quill SSR imports.
         */
        this.setState({
            loaded: true,
        })
    }

    public onChange = (text: string) => {
        const markdown = this.turndownService.turndown(text)
        this.props.onChange(markdown)
    }

    public render(): React.ReactNode {
        if (!this.state.loaded) {
            return <FontAwesomeIcon width={13} icon={faSpinner} spin />
        }

        const { Editor } = this.quillBase

        return (
            <>
                <Editor
                    key={'editor'}
                    onChange={this.onChange}
                    formats={[
                        'header',
                        'font',
                        'size',
                        'bold',
                        'italic',
                        'underline',
                        'strike',
                        'blockquote',
                        'list',
                        'bullet',
                        'indent',
                        'link',
                        'image',
                        'video',
                        'mention',
                    ]}
                    modules={{
                        mention: this.modules.mention,
                    }}
                />
            </>
        )
    }
}

export default Editor
