import * as React from 'react'
import { observer } from 'mobx-react'
import sanitizeHTML from 'sanitize-html'
import axios from 'axios'
import { nsdb } from '@novuspherejs'
import { StoreContext } from '@stores'
import cx from 'classnames'
import { Icon } from 'antd'

import styles from './Editor.module.scss'

interface IEditorProps {
    onChange: (html: any) => void // passed in via spread (bind) in form.tsx
    placeholder?: string
    className?: string
    value?: any
    disabled?: boolean

    threadUsers: any[]
}

@observer
class Editor extends React.Component<IEditorProps> {
    state = {
        loaded: false,
    }

    constructor(props) {
        super(props)

        this.context = StoreContext
    }

    static defaultProps = {
        placeholder: 'Enter your reply',
        className: '',
        disabled: false,
        threadUsers: [],
    } as any

    public turndownService: any
    public showdownService: any

    private quillBase: any
    private modules: any = null

    private ref = React.createRef<any>()

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

        this.quillBase.Quill.debug('error')

        const mention = await import('quill-mention')
        const Mention = mention.default

        const autoformat = await import('@modules/quill-autoformat/dist/quill-autoformat.js')
        const Autoformat = autoformat.default
        const Hashtag = autoformat.Hashtag

        const blockEmbedLink = await import('quill-magic-url')
        const MagicUrl = blockEmbedLink.default

        const turndownImport = await import('turndown')
        const Turndown = turndownImport.default

        const showdownImport = await import('showdown')
        const showdown = showdownImport.default

        this.turndownService = new Turndown()
        this.showdownService = new showdown.Converter({
            smartIndentationFix: true,
            simpleLineBreaks: true,
        })

        this.turndownService.addRule('h1', {
            filter: ['h1'],
            replacement: (content: any) => `<p># ${content}</p>`,
        })

        this.turndownService.addRule('h2', {
            filter: ['h2'],
            replacement: (content: any) => `<p>## ${content}</p>`,
        })

        this.quillBase.Quill.register('modules/mention', Mention)
        this.quillBase.Quill.register('modules/autoformat', Autoformat)
        this.quillBase.Quill.register('formats/hashtag', Hashtag)
        this.quillBase.Quill.register('modules/magicUrl', MagicUrl)

        this.modules = {
            mention: {
                fixMentionsToQuill: true,
                mentionDenotationChars: ['@'],
                source: async (searchTerm: string, renderList: any, mentionChar: any) => {
                    const accounts = this.props.threadUsers

                    if (searchTerm.length === 0) {
                        renderList(accounts, searchTerm)
                    } else {
                        const matches = []
                        for (let i = 0; i < accounts.length; i++) {
                            if (
                                ~accounts[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                            ) {
                                matches.push(accounts[i])
                            }
                        }
                        renderList(matches, searchTerm)
                    }
                },
                renderItem: (item: { icon: any; id: any; value: any }) => {
                    const image = `<img width=20 height=20 src="${item.icon}" class="mention-list-icon" />`
                    return `<span class="mention-list-item" title={${item.id}}>${image} <span>${item.value}</span></span>`
                },
                onSelect: (item: any, insertItem: any) => {
                    item.value = `<a href=/u/${item.value}-${item.id}>@${item.value}</a>`
                    item.denotationChar = ''
                    return insertItem(item)
                },
                mentionContainerClass: cx([styles.mentionList, 'bg-white f5 ba b--light-gray']),
                // listItemClass: cx([styles.mentionItem])
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

        if (this.props.value && this.props.value.length) {
            this.updateContentByRef(this.showdownService.makeHtml(this.props.value))
        }

        if (this.props.disabled) {
            this.ref.current.getEditor().disable()
        }
    }

    private updateContentByRef = (content: any) => {
        if (this.ref && this.ref.current && typeof this.props.value !== 'undefined') {
            const editor = this.ref.current.getEditor()
            editor.pasteHTML(content)
        }
    }

    componentWillReceiveProps(nextProps: Readonly<IEditorProps>, nextContext: any): void {
        if (this.props.value && this.props.value.length > 0 && nextProps.value === '') {
            this.updateContentByRef('')
        }

        if (!nextProps.disabled) {
            if (this.ref.current) {
                this.ref.current.getEditor().enable()
            }
        }
    }

    public onChange = (text: string) => {
        const clean = sanitizeHTML(text, {
            allowedTags: [...sanitizeHTML.defaults.allowedTags, 'h1', 'h2'],
            allowedAttributes: {
                ...sanitizeHTML.defaults.allowedAttributes,
            },
        })

        const markdown = this.turndownService.turndown(clean)

        // https://github.com/Novusphere/discussions-app/issues/169
        // this might have to be re-visited
        this.props.onChange(
            markdown
                .replace(/[\u200B-\u200D\uFEFF]/g, '')
                .replace('#tip[]', '[#tip]')
                .replace('[](https://discussions.app/tag/tip)', '')
        )
    }

    private handleImageUpload = async () => {
        const input = document.createElement('input')

        input.setAttribute('type', 'file')
        input.click()

        // Once file is selected.
        input.onchange = async () => {
            const file = input.files[0]

            // Validate file type is an image.
            if (/^image\//.test(file.type)) {
                // Create form.
                const formData = new FormData()
                formData.append('image', file)

                try {
                    // Upload image to AWS via app route handler.
                    const { data } = await axios.post(`${nsdb.api}/discussions/upload`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    })

                    const ref = this.ref.current.getEditor()

                    // Get the current cursor position.
                    const range = ref.getSelection()
                    const url = `${nsdb.api}/discussions/upload/image/${data.filename}`

                    ref.insertText(range.index, url)

                    // Move the cursor past the image.
                    ref.setSelection(range.index + url.length)
                } catch (error) {
                    return error
                }
            }
        }
    }

    public render(): React.ReactNode {
        if (!this.state.loaded) {
            return <Icon type="loading" />
        }

        const { Editor } = this.quillBase
        const { placeholder } = this.props

        return (
            <>
                <Editor
                    disabled={this.props.disabled}
                    classNames={cx([this.props.className, 'bg-white'])}
                    ref={this.ref}
                    key={'editor'}
                    debug={'error'}
                    placeholder={placeholder}
                    onChange={this.onChange}
                    style={{
                        opacity: this.props.disabled ? 0.5 : 1,
                        cursor: this.props.disabled ? 'not-allowed' : 'default',
                    }}
                    modules={{
                        autoformat: this.modules.autoformat,
                        mention: this.modules.mention,
                        magicUrl: true,
                        toolbar: {
                            container: [
                                [{ header: 1 }, { header: 2 }], // custom button values
                                [{ list: 'ordered' }, { list: 'bullet' }],
                                ['bold', 'italic', 'blockquote', 'link', 'image'],
                            ],
                            handlers: {
                                image: this.handleImageUpload,
                            },
                        },
                    }}
                />
            </>
        )
    }
}

export default Editor
