import { Quill } from 'react-quill'
import Delta from 'quill-delta'
import { DeltaStatic } from 'quill'

import { nsdb } from '../../novusphere-js'

const BlockEmbed = Quill.import('blots/block/embed')

export default class QuillOEmbedModule {
    private quill: Quill

    constructor(quill: Quill) {
        this.quill = quill
        quill.clipboard.addMatcher(Node.TEXT_NODE, this.pasteHandler.bind(this))
    }

    private static isValidUrl(potentialUrl: string): boolean {
        try {
            new URL(potentialUrl)
            return true
        } catch (e) {
            return false
        }
    }

    private static getOEmbedData(oEmbed: any): OEmbedData {
        if (oEmbed.width || oEmbed.height) {
            return { html: oEmbed.html, height: oEmbed.height, width: oEmbed.width }
        }

        if (oEmbed.thumbnail_width || oEmbed.thumbnail_height) {
            return {
                html: oEmbed.html,
                height: oEmbed.thumbnail_height,
                width: oEmbed.thumbnail_width,
            }
        }

        return { html: oEmbed.html, height: 500, width: 500 }
    }

    private insertInlineLink = (node, delta) => {
        const newDelta = new Delta()
        let str = node.data

        const matches = node.data.match(/(https?:\/\/|www\.)[\S]+/g)

        if (matches) {
            matches.forEach(match => {
                const split = str.split(match)
                const beforeLink = split.shift()
                newDelta.insert(beforeLink)
                newDelta.insert(match, { link: match })
                str = split.join(match)
            })
            newDelta.insert(str)
        }

        delta.ops = newDelta.ops
        return delta
    }

    private pasteHandler(node: any, delta: DeltaStatic): DeltaStatic {
        if (
            delta.ops &&
            QuillOEmbedModule.isValidUrl(node.data)
            // && node.data.toLowerCase().indexOf('oembed') > -1
        ) {
            const index = this.quill.getSelection(true).index

            let ombed = ''
            let _delta = this.insertInlineLink(node, delta)

            if (node.data.search(/imgur/) !== -1) {
                ombed = `https://api.imgur.com/oembed.json?url=${node.data}`
                _delta = null
            } else if (node.data.search(/twitter/) !== -1) {
                ombed = `https://publish.twitter.com/oembed?url=${node.data}`
                _delta = null
            } else if (node.data.search(/youtube|youtu.be/) !== -1) {
                // this.quill.insertEmbed(index, 'video', node.data, 'api')
                // return this.insertInlineLink(node, delta)
                ombed = `https://www.youtube.com/oembed?format=json&url=${node.data}`
                _delta = null
            } else if (node.data.search(/d.tube/) !== -1) {
                ombed = `https://api.d.tube/oembed?url=${node.data}`
                _delta = null
            } else if (node.data.search(/soundcloud/) !== -1) {
                ombed = `https://soundcloud.com/oembed?format=json&url=${node.data}`
                _delta = null
            } else if (node.data.search(/instagram/) !== -1) {
                ombed = `https://api.instagram.com/oembed/?url=${node.data}`
                _delta = null
            } else if (node.data.search(/twitter/) !== -1) {
                ombed = `https://db.novusphere.io/service/cors/?https://publish.twitter.com/oembed?url=${node.data}`
                _delta = null
            } else {
                return this.insertInlineLink(node, delta)
            }

            nsdb.cors(ombed)
                .then(result => result)
                .then(json => this.insertEmbedFromJson(json, index, node.data))
                // .then(([delta, remove]) => {
                //     console.log('Class: QuillOEmbedModule, Function: a, Line 67 node.data: ', node.data);
                //     console.log('Class: QuillOEmbedModule, Function: a, Line 68 index: ', index);
                //     console.log('Class: QuillOEmbedModule, Function: a, Line 93 delta: ', delta);
                //     console.log('Class: QuillOEmbedModule, Function: a, Line 94 delta.length(): ', delta.length());
                //
                //     if (remove) {
                //         this.quill.deleteText(index, node.data.length)
                //     }
                // })
                .catch(() => {
                    // const targetUrl = new URL(node.data).searchParams.get('url')
                    // if (targetUrl && QuillOEmbedModule.isValidUrl(targetUrl)) {
                    //     this.quill.deleteText(index, node.data.length)
                    //     this.quill.insertText(index, targetUrl)
                    // }
                    _delta = this.insertInlineLink(node, delta)
                })

            if (_delta) {
                return _delta
            }
        }

        return delta
    }

    private insertEmbedFromJson(
        oEmbed: any,
        index: number,
        originalUrl: string
    ): [DeltaStatic, boolean] {
        switch (oEmbed.type) {
            case 'photo':
                this.quill.insertEmbed(index, 'image', oEmbed.url, 'api')
                return [null, true]
            case 'video':
            case 'rich': {
                const data: OEmbedData = QuillOEmbedModule.getOEmbedData(oEmbed)
                const delta = this.quill.insertEmbed(index, 'oembed-wrapper', data, 'api')
                return [delta, true]
            }
            default:
                return [null, false]
        }
    }
}

interface OEmbedData {
    html: string
    width: number
    height: number
}

/**
 * Extension of the BlockEmbed class to allow Quill-sided creation of an iframe with the content we want.
 *
 * Also allows for width and height of the resulting iframe to be set.
 */
class OEmbedWrapper extends BlockEmbed {
    static create(value: OEmbedData) {
        const { html, width, height } = value
        const node = super.create(html)

        node.innerHTML = html

        console.log('Class: OEmbedWrapper, Function: create, Line 164 html: ', node);
        //
        // node.setAttribute('srcdoc', html)
        // node.setAttribute('width', width)
        // node.setAttribute('height', height)
        //
        // node.setAttribute('frameborder', '0')
        // node.setAttribute('allowfullscreen', true)

        return node
    }

    static value(node: any) {
        return node.getAttribute('srcdoc')
    }
}

//Name for Quill to find this embed under
OEmbedWrapper.blotName = 'oembed-wrapper'
OEmbedWrapper.className = 'oembed-main'

//Tag to create by Quill
OEmbedWrapper.tagName = 'object'

Quill.register(OEmbedWrapper, true)
