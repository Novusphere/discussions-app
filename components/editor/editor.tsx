import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

interface IEditorProps {
    postsStore?: IStores['postsStore']
    onChange: (html: any) => void // passed in via spread (bind) in form.tsx
    placeholder: string
    className?: string
    value?: any
}

@inject('postsStore')
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

        const autoformat = await import('@modules/quill-autoformat/dist/quill-autoformat.js')
        const Autoformat = autoformat.default
        const Hashtag = autoformat.Hashtag

        const turndownImport = await import('turndown')
        const Turndown = turndownImport.default

        this.turndownService = new Turndown()

        this.quillBase.Quill.register('modules/mention', Mention)
        this.quillBase.Quill.register('modules/autoformat', Autoformat)
        this.quillBase.Quill.register('formats/hashtag', Hashtag)

        this.modules = {
            mention: {
                fixMentionsToQuill: true,
                mentionDenotationChars: ['@'],
                source: async (searchTerm, renderList, mentionChar) => {
                    const accounts = this.props.postsStore.getPossibleUsersToTag

                    let values

                    if (mentionChar === '@') {
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
                renderItem: (item, searchTerm) => {
                    const image = `<img width=20 height=20 src="data:image/png;base64,${item.icon}" class="mention-list-icon" />`
                    return `<span class="mention-list-item">${image} <span>${item.value}</span></span>`
                },
                onSelect: (item, insertItem) => {
                    item.value = `<a href='${window.location.origin + '/u/' + item.value}'>@${
                        item.value
                    }</a>`
                    item.denotationChar = ''
                    return insertItem(item)
                },
            },
            autoformat: true,
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
                    'hashtag',
                ]}
                modules={{
                    autoformat: this.modules.autoformat,
                    mention: this.modules.mention,
                }}
            />
        )
    }
}

export default Editor
