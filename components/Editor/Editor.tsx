import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import sanitizeHTML from 'sanitize-html'
import dynamic from 'next/dynamic'

interface IEditorProps {
    postsStore?: IStores['postsStore']
    onChange: (html: any) => void // passed in via spread (bind) in form.tsx
    placeholder: string
    className?: string
    value?: any
    disabled?: boolean
}

@inject('postsStore')
@observer
class EditorComponent extends React.Component<IEditorProps> {
    state = {
        loaded: false,
    }

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

        const eosTip = await import('@modules/eos-tip/src/eos.tip.js')
        const EosTip = eosTip.default

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

        this.quillBase.Quill.register('modules/mention', Mention)
        // this.quillBase.Quill.register('modules/eos-tip', EosTip)
        this.quillBase.Quill.register('modules/autoformat', Autoformat)
        this.quillBase.Quill.register('formats/hashtag', Hashtag)
        this.quillBase.Quill.register('modules/magicUrl', MagicUrl)

        this.modules = {
            mention: {
                fixMentionsToQuill: true,
                mentionDenotationChars: ['@'],
                source: async (searchTerm, renderList, mentionChar) => {
                    const accounts = this.props.postsStore.getPossibleUsersToTag

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
                renderItem: item => {
                    const image = `<img width=20 height=20 src="${item.icon}" class="mention-list-icon" />`
                    return `<span class="mention-list-item" title={${item.id}}>${image} <span>${item.value}</span></span>`
                },
                onSelect: (item, insertItem) => {
                    item.value = `<a href=https://beta.discussions.app/u/${item.value}-${item.id}>@${item.value}</a>`
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

        if (this.props.value && this.props.value.length) {
            this.updateContentByRef(this.showdownService.makeHtml(this.props.value))
        }

        if (this.props.disabled) {
            this.ref.current.getEditor().disable()
        }
    }

    private updateContentByRef = content => {
        if (this.ref && this.ref.current && typeof this.props.value !== 'undefined') {
            const editor = this.ref.current.getEditor()
            editor.pasteHTML(content)
        }
    }

    componentWillReceiveProps(nextProps: Readonly<IEditorProps>, nextContext: any): void {
        if (this.props.value.length > 0 && nextProps.value === '') {
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
            allowedTags: [...sanitizeHTML.defaults.allowedTags],
            allowedAttributes: {
                ...sanitizeHTML.defaults.allowedAttributes,
            },
        })
        const markdown = this.turndownService.turndown(clean)
        this.props.onChange(markdown)
    }

    public render(): React.ReactNode {
        if (!this.state.loaded) {
            return <FontAwesomeIcon width={13} icon={faSpinner} spin />
        }

        const { Editor } = this.quillBase
        const { placeholder } = this.props

        return (
            <Editor
                readOnly={true}
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
                    toolbar: [
                        [{ header: 1 }, { header: 2 }], // custom button values
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['bold', 'italic', 'blockquote', 'link', 'image'],
                    ],
                }}
            />
        )
    }
}

export default dynamic(() => Promise.resolve(EditorComponent), {
    ssr: false,
    loading: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
})
