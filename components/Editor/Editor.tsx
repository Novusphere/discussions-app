import * as React from 'react'
import { observer } from 'mobx-react'
import sanitizeHTML from 'sanitize-html'
import axios from 'axios'
import { nsdb } from '@novuspherejs'
import { StoreContext } from '@stores'
import cx from 'classnames'
import { Spin, notification, Select, Popconfirm, InputNumber, Icon } from 'antd'
const { Option } = Select

import styles from './Editor.module.scss'
import { useCallback, useState } from 'react'
import { useMemo } from 'react'
import { generateUuid } from '@utils'

interface IEditorProps {
    onChange: (html: any) => void // passed in via spread (bind) in form.tsx
    placeholder?: string
    className?: string
    value?: any
    disabled?: boolean

    threadUsers: any[]
}

interface IEditorState {
    toolbarId: string
    loaded: boolean
    loading: boolean
}

const prefix = 'toolbar-'

const CustomToolbar = ({ addTip, toolbarId }) => {
    const [amount, setAmount] = useState(0)
    const [symbol, setSymbol] = useState('')

    const onAmountChange = useCallback(value => {
        setAmount(value)
    }, [])

    const onTokenChange = useCallback(symbol => {
        setSymbol(symbol)
    }, [])

    const onConfirm = useCallback(() => addTip({ amount, symbol }), [amount, symbol])

    let walletStore = useMemo(() => window.localStorage.getItem('walletStore'), [])
    let tokens = {}

    if (walletStore) {
        walletStore = JSON.parse(walletStore)
        tokens = walletStore['supportedTokensImages']
    }

    return (
        <div id={`${prefix}${toolbarId}`} className="ql-toolbar ql-snow">
            <span className="ql-formats">
                <button type="button" className="ql-header" value="1">
                    <svg viewBox="0 0 18 18">
                        <path
                            className="ql-fill"
                            d="M10,4V14a1,1,0,0,1-2,0V10H3v4a1,1,0,0,1-2,0V4A1,1,0,0,1,3,4V8H8V4a1,1,0,0,1,2,0Zm6.06787,9.209H14.98975V7.59863a.54085.54085,0,0,0-.605-.60547h-.62744a1.01119,1.01119,0,0,0-.748.29688L11.645,8.56641a.5435.5435,0,0,0-.022.8584l.28613.30762a.53861.53861,0,0,0,.84717.0332l.09912-.08789a1.2137,1.2137,0,0,0,.2417-.35254h.02246s-.01123.30859-.01123.60547V13.209H12.041a.54085.54085,0,0,0-.605.60547v.43945a.54085.54085,0,0,0,.605.60547h4.02686a.54085.54085,0,0,0,.605-.60547v-.43945A.54085.54085,0,0,0,16.06787,13.209Z"
                        ></path>
                    </svg>
                </button>
                <button type="button" className="ql-header" value="2">
                    <svg viewBox="0 0 18 18">
                        <path
                            className="ql-fill"
                            d="M16.73975,13.81445v.43945a.54085.54085,0,0,1-.605.60547H11.855a.58392.58392,0,0,1-.64893-.60547V14.0127c0-2.90527,3.39941-3.42187,3.39941-4.55469a.77675.77675,0,0,0-.84717-.78125,1.17684,1.17684,0,0,0-.83594.38477c-.2749.26367-.561.374-.85791.13184l-.4292-.34082c-.30811-.24219-.38525-.51758-.1543-.81445a2.97155,2.97155,0,0,1,2.45361-1.17676,2.45393,2.45393,0,0,1,2.68408,2.40918c0,2.45312-3.1792,2.92676-3.27832,3.93848h2.79443A.54085.54085,0,0,1,16.73975,13.81445ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z"
                        ></path>
                    </svg>
                </button>
            </span>
            <span className="ql-formats">
                <button type="button" className="ql-list" value="ordered">
                    <svg viewBox="0 0 18 18">
                        <line className="ql-stroke" x1="7" x2="15" y1="4" y2="4"></line>
                        <line className="ql-stroke" x1="7" x2="15" y1="9" y2="9"></line>
                        <line className="ql-stroke" x1="7" x2="15" y1="14" y2="14"></line>
                        <line
                            className="ql-stroke ql-thin"
                            x1="2.5"
                            x2="4.5"
                            y1="5.5"
                            y2="5.5"
                        ></line>
                        <path
                            className="ql-fill"
                            d="M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z"
                        ></path>
                        <path
                            className="ql-stroke ql-thin"
                            d="M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156"
                        ></path>
                        <path
                            className="ql-stroke ql-thin"
                            d="M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109"
                        ></path>
                    </svg>
                </button>
                <button type="button" className="ql-list" value="bullet">
                    <svg viewBox="0 0 18 18">
                        <line className="ql-stroke" x1="6" x2="15" y1="4" y2="4"></line>
                        <line className="ql-stroke" x1="6" x2="15" y1="9" y2="9"></line>
                        <line className="ql-stroke" x1="6" x2="15" y1="14" y2="14"></line>
                        <line className="ql-stroke" x1="3" x2="3" y1="4" y2="4"></line>
                        <line className="ql-stroke" x1="3" x2="3" y1="9" y2="9"></line>
                        <line className="ql-stroke" x1="3" x2="3" y1="14" y2="14"></line>
                    </svg>
                </button>
            </span>
            <span className="ql-formats">
                <button type="button" className="ql-bold">
                    <svg viewBox="0 0 18 18">
                        <path
                            className="ql-stroke"
                            d="M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z"
                        ></path>
                        <path
                            className="ql-stroke"
                            d="M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z"
                        ></path>
                    </svg>
                </button>
                <button type="button" className="ql-italic">
                    <svg viewBox="0 0 18 18">
                        <line className="ql-stroke" x1="7" x2="13" y1="4" y2="4"></line>
                        <line className="ql-stroke" x1="5" x2="11" y1="14" y2="14"></line>
                        <line className="ql-stroke" x1="8" x2="10" y1="14" y2="4"></line>
                    </svg>
                </button>
                <button type="button" className="ql-blockquote">
                    <svg viewBox="0 0 18 18">
                        <rect className="ql-fill ql-stroke" height="3" width="3" x="4" y="5"></rect>
                        <rect
                            className="ql-fill ql-stroke"
                            height="3"
                            width="3"
                            x="11"
                            y="5"
                        ></rect>
                        <path className="ql-even ql-fill ql-stroke" d="M7,8c0,4.031-3,5-3,5"></path>
                        <path
                            className="ql-even ql-fill ql-stroke"
                            d="M14,8c0,4.031-3,5-3,5"
                        ></path>
                    </svg>
                </button>
                <button type="button" className="ql-link">
                    <svg viewBox="0 0 18 18">
                        <line className="ql-stroke" x1="7" x2="11" y1="7" y2="11"></line>
                        <path
                            className="ql-even ql-stroke"
                            d="M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z"
                        ></path>
                        <path
                            className="ql-even ql-stroke"
                            d="M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z"
                        ></path>
                    </svg>
                </button>
                <button type="button" className="ql-image">
                    <svg viewBox="0 0 18 18">
                        <rect className="ql-stroke" height="10" width="12" x="3" y="4"></rect>
                        <circle className="ql-fill" cx="6" cy="7" r="1"></circle>
                        <polyline
                            className="ql-even ql-fill"
                            points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12"
                        ></polyline>
                    </svg>
                </button>
            </span>
            <span className="ql-formats">
                <Popconfirm
                    icon={<Icon type="dollar" />}
                    placement="topLeft"
                    title={
                        <div>
                            <span className={'flex flex-row items-center justify-between mb1'}>
                                Amount
                                <InputNumber
                                    min={0}
                                    onChange={onAmountChange}
                                    className={styles.tipInput}
                                />
                            </span>
                            <span className={'flex flex-row items-center justify-between'}>
                                Token
                                <Select className={styles.tipInput} onChange={onTokenChange}>
                                    {Object.keys(tokens).length > 0
                                        ? Object.keys(tokens).map(token => (
                                              <Option value={token} key={token}>
                                                  {token}
                                              </Option>
                                          ))
                                        : null}
                                </Select>
                            </span>
                        </div>
                    }
                    onConfirm={onConfirm}
                    okText="Add Tip"
                    cancelText="Close"
                >
                    <button type="button" className="ql-inline-tip" onMouseDown={e => e.preventDefault()}>
                        <svg
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fas"
                            data-icon="comment-dollar"
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            className="svg-inline--fa fa-comment-dollar fa-w-16 fa-2x"
                        >
                            <path
                                fill="currentColor"
                                d="M256 32C114.62 32 0 125.12 0 240c0 49.56 21.41 95.01 57.02 130.74C44.46 421.05 2.7 465.97 2.2 466.5A7.995 7.995 0 0 0 8 480c66.26 0 115.99-31.75 140.6-51.38C181.29 440.93 217.59 448 256 448c141.38 0 256-93.12 256-208S397.38 32 256 32zm24 302.44V352c0 8.84-7.16 16-16 16h-16c-8.84 0-16-7.16-16-16v-17.73c-11.42-1.35-22.28-5.19-31.78-11.46-6.22-4.11-6.82-13.11-1.55-18.38l17.52-17.52c3.74-3.74 9.31-4.24 14.11-2.03 3.18 1.46 6.66 2.22 10.26 2.22h32.78c4.66 0 8.44-3.78 8.44-8.42 0-3.75-2.52-7.08-6.12-8.11l-50.07-14.3c-22.25-6.35-40.01-24.71-42.91-47.67-4.05-32.07 19.03-59.43 49.32-63.05V128c0-8.84 7.16-16 16-16h16c8.84 0 16 7.16 16 16v17.73c11.42 1.35 22.28 5.19 31.78 11.46 6.22 4.11 6.82 13.11 1.55 18.38l-17.52 17.52c-3.74 3.74-9.31 4.24-14.11 2.03a24.516 24.516 0 0 0-10.26-2.22h-32.78c-4.66 0-8.44 3.78-8.44 8.42 0 3.75 2.52 7.08 6.12 8.11l50.07 14.3c22.25 6.36 40.01 24.71 42.91 47.67 4.05 32.06-19.03 59.42-49.32 63.04z"
                                className=""
                            ></path>
                        </svg>
                    </button>
                </Popconfirm>
            </span>
        </div>
    )
}

@observer
class Editor extends React.Component<IEditorProps, IEditorState> {
    state = {
        toolbarId: `${prefix}${generateUuid()}`,
        loaded: false,
        loading: false,
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

    setLoading = loading => {
        this.setState(prevState => ({
            loading: loading,
        }))
    }

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

        // this.turndownService.addRule('h1', {
        //     filter: ['h1'],
        //     replacement: (content: any) => `<p># ${content}</p>`,
        // })
        //
        // this.turndownService.addRule('h2', {
        //     filter: ['h2'],
        //     replacement: (content: any) => `<p>## ${content}</p>`,
        // })

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
            /**
             * We have to replace every <p># ... </p> tag (etc)
             * so markdown can properly render.
             */
            const html = this.showdownService.makeHtml(
                this.props.value
                    .replace('<p># ', '#')
                    .replace('<p>## ', '##')
                    .replace('</p>', '<br />')
            )

            this.updateContentByRef(this.sanitizeHTML(html))
        }

        if (this.props.disabled) {
            this.ref.current.getEditor().disable()
        }
    }

    private updateContentByRef = (content: any) => {
        if (this.ref && this.ref.current && typeof this.props.value !== 'undefined') {
            const editor = this.ref.current.getEditor()
            editor.clipboard.dangerouslyPasteHTML(content)
            // editor.pasteHTML(content)
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

    private sanitizeHTML = html => {
        return sanitizeHTML(html, {
            allowedTags: [
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'blockquote',
                'p',
                'a',
                'ul',
                'ol',
                'nl',
                'li',
                'b',
                'i',
                'strong',
                'em',
                'strike',
                'code',
                // 'hr',
                'br',
                // 'div',
                // 'table',
                // 'thead',
                'caption',
                // 'tbody',
                // 'tr',
                // 'th',
                // 'td',
                // 'pre',
                // 'iframe',
            ],
            // allowedTags: [...sanitizeHTML.defaults.allowedTags, 'h1', 'h2'],
            allowedAttributes: {
                ...sanitizeHTML.defaults.allowedAttributes,
            },
        })
    }

    public onChange = (text: string) => {
        const markdown = this.turndownService.turndown(this.sanitizeHTML(text))
        const replacedMarkdown = markdown
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace('#tip[]', '[#tip]')
            .replace('[](https://discussions.app/tag/tip)', '')

        // https://github.com/Novusphere/discussions-app/issues/169
        // this might have to be re-visited

        this.props.onChange(replacedMarkdown)
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
                    this.setLoading(true)
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

                    ref.insertText(range.index, url, { link: url })
                    // Move the cursor past the image.
                    ref.setSelection(range.index + url.length)
                    this.setLoading(false)
                } catch (error) {
                    notification.error({
                        message: 'Your image failed to upload',
                        description: 'Please try again',
                    })
                    this.setLoading(false)
                    return error
                }
            }
        }
    }

    addTip = ({ amount, symbol }) => {
        if (amount > 0 && symbol.length) {
            const ref = this.ref.current.getEditor()
            ref.focus()
            const range = ref.getSelection()
            let position = range ? range.index : 0
            ref.insertText(position, ' ')
            ref.insertText(ref.getSelection().index, '#tip', { link: '/tag/tip' })
            ref.insertText(ref.getSelection().index, ' ', { link: false })
            ref.insertText(ref.getSelection().index, `${amount} ${symbol}`, { link: false })
        }
    }

    public render(): React.ReactNode {
        const { toolbarId } = this.state

        if (!this.state.loaded || !toolbarId) {
            return <Spin />
        }

        const { Editor: QuillEditor } = this.quillBase
        const { placeholder } = this.props

        return (
            <div className={styles.editorContainer}>
                {this.state.loading && <Spin className={styles.editorSpin} />}
                <CustomToolbar addTip={this.addTip} toolbarId={toolbarId} />
                <QuillEditor
                    disabled={this.props.disabled}
                    classNames={cx([this.props.className, 'bg-white'])}
                    ref={this.ref}
                    key={'editor'}
                    debug={'error'}
                    // placeholder={placeholder}
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
                            container: `#${prefix}${toolbarId}`,
                            // container: [
                            //     [{ header: 1 }, { header: 2 }], // custom button values
                            //     [{ list: 'ordered' }, { list: 'bullet' }],
                            //     ['bold', 'italic', 'blockquote', 'link', 'image'],
                            // ],
                            handlers: {
                                image: this.handleImageUpload,
                            },
                        },
                    }}
                />
            </div>
        )
    }
}

export default Editor
