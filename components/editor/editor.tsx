import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import sanitizeHTML from 'sanitize-html'
import { allowedHosts } from '@utils'
const { toDelta } = require('delta-markdown-for-quill')

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

        const mention = await import('quill-mention')
        const Mention = mention.default

        const autoformat = await import('@modules/quill-autoformat/dist/quill-autoformat.js')
        const Autoformat = autoformat.default
        const Hashtag = autoformat.Hashtag

        const blockEmbedVideo = await import('@modules/quill-custom-video')
        const Video = blockEmbedVideo.default
        const BlockEmbedVideo = blockEmbedVideo.Video

        const oembed = await import('@modules/quill-oembed/quill-oembed.ts')
        const OEmbed = oembed.default

        // const blockEmbedLink = await import('@modules/quill-custom-link')
        // const MagicUrl = blockEmbedLink.default

        const turndownImport = await import('turndown')
        const Turndown = turndownImport.default

        const showdownImport = await import('showdown')
        const showdown = showdownImport.default

        this.turndownService = new Turndown()
        this.showdownService = new showdown.Converter()

        // to keep HTML tags as is without converting to markdown
        this.turndownService.keep(['iframe', 'object'])

        this.quillBase.Quill.register('modules/mention', Mention)
        this.quillBase.Quill.register('modules/autoformat', Autoformat)
        this.quillBase.Quill.register('formats/hashtag', Hashtag)
        // this.quillBase.Quill.register('modules/magicUrl', MagicUrl)
        this.quillBase.Quill.register('modules/oembed', OEmbed)

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

        if (this.props.value) {
            this.updateContentByRef(this.showdownService.makeHtml(this.props.value))
        }
    }

    private updateContentByRef = content => {
        if (this.ref && this.ref.current && typeof this.props.value !== 'undefined') {
            const editor = this.ref.current.getEditor()
            editor['container']['childNodes'][0].innerHTML = content
            // editor.clipboard.dangerouslyPasteHTML(content, 'silent')
        }
    }

    componentWillReceiveProps(nextProps: Readonly<IEditorProps>, nextContext: any): void {
        if (nextProps.value === '') {
            this.updateContentByRef('')
        }
    }

    public onChange = (text: string) => {
        const clean = sanitizeHTML(text, {
            allowedTags: [...sanitizeHTML.defaults.allowedTags, 'object'],
            allowedAttributes: {
                ...sanitizeHTML.defaults.allowedAttributes,
                iframe: [
                    'width',
                    'height',
                    'src',
                    'srcdoc',
                    'frameborder',
                    'allow',
                    'allowfullscreen',
                ],
                object: ['class'],
                a: ['href', 'rel', 'target'],
                blockquote: ['class', 'lang', 'data-id'],
            },
            // parser: {
            //     decodeEntities: false,
            // },
            allowedIframeHostnames: ['www.youtube.com', 'www.youtu.be'],
            transformTags: {
                iframe: (tagName, attribs) => {
                    return {
                        tagName: 'iframe',
                        attribs: {
                            ...attribs,
                            ...(attribs.srcdoc && {
                                srcdoc: attribs.srcdoc.replace('"', '\''),
                            }),
                        },
                    }
                },
                a: (tagName, attribs) =>
                    allowedHosts.some(host => attribs.href.includes(host))
                        ? {
                              tagName: 'a',
                              attribs: { href: attribs.href },
                          }
                        : {},
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
                ref={this.ref}
                key={'editor'}
                placeholder={placeholder}
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
                    'oembed-wrapper',
                ]}
                modules={{
                    autoformat: this.modules.autoformat,
                    mention: this.modules.mention,
                    // magicUrl: true,
                    oembed: true,
                    toolbar: [
                        [{ header: 1 }, { header: 2 }], // custom button values
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        [
                            'bold',
                            'italic',
                            // 'underline',
                            // 'strike',
                            'blockquote',
                            'list',
                            'bullet',

                            'link',
                            'image',
                            'video',
                        ],
                    ],
                }}
            />
        )
    }
}

export default Editor
