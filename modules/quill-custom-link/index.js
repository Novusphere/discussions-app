import Delta from 'quill-delta'
import normalizeUrl from 'normalize-url'
import { nsdb } from '../../novusphere-js'

const defaults = {
    globalRegularExpression: /(https?:\/\/|www\.)[\S]+/g,
    urlRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)/,
    normalizeRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)/,
    normalizeUrlOptions: {
        stripFragment: false,
        stripWWW: false,
    },
}

export default class MagicUrl {
    constructor(quill, options) {
        this.quill = quill
        options = options || {}
        this.options = { ...defaults, ...options }
        this.registerTypeListener()
        // this.registerPasteListener()
    }

    registerPasteListener() {
        this.quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
            if (typeof node.data !== 'string') {
                return
            }
            const matches = node.data.match(this.options.globalRegularExpression)
            if (matches && matches.length > 0) {
                const newDelta = new Delta()
                let str = node.data
                matches.forEach(match => {
                    const split = str.split(match)
                    const beforeLink = split.shift()
                    newDelta.insert(beforeLink)
                    newDelta.insert(match, { link: this.normalize(match) })
                    str = split.join(match)
                })
                newDelta.insert(str)
                delta.ops = newDelta.ops
            }
            return delta
        })
    }

    registerTypeListener() {
        this.quill.on('text-change', delta => {
            let ops = delta.ops
            // Only return true, if last operation includes whitespace inserts
            // Equivalent to listening for enter, tab or space
            if (!ops || ops.length < 1 || ops.length > 2) {
                return
            }
            let lastOp = ops[ops.length - 1]
            if (!lastOp.insert || typeof lastOp.insert !== 'string' || !lastOp.insert.match(/\s/)) {
                return
            }
            this.checkTextForUrl()
        })
    }

    checkTextForUrl() {
        let sel = this.quill.getSelection()

        if (!sel) {
            return
        }

        let [leaf] = this.quill.getLeaf(sel.index)

        if (!leaf.text || leaf.parent.domNode.localName === 'a') {
            // if (!leaf.text) {
            return
        }

        let urlMatch = leaf.text.match(this.options.urlRegularExpression)

        if (!urlMatch) {
            return
        }

        let leafIndex = this.quill.getIndex(leaf)
        let index = leafIndex + urlMatch.index

        this.textToUrl(index, urlMatch[0])
    }

    async textToUrl(index, url) {
        const opsDefault = new Delta().retain(index).delete(url.length)

        let ops = opsDefault.insert(url, { link: this.normalize(url) })

        if (url.match(/youtube/)) {
            ops = opsDefault.insert('\n', {
                video: url,
            })
        }

        // if (url.match(/imgur.com/)) {
        //     const data = await nsdb.cors(`https://api.imgur.com/oembed.json?url=${url}`)
        //
        //     console.log(data['html'].replace(
        //         '<script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>',
        //         '',
        //     ))
        //
        //     ops = this.quill.clipboard.convert(data['html'])
        // }
        
        console.log('Class: MagicUrl, Function: textToUrl, Line 111 ops: ', ops);

        this.quill.updateContents(ops)
    }

    normalize(url) {
        if (this.options.normalizeRegularExpression.test(url)) {
            return normalizeUrl(url, this.options.normalizeUrlOptions)
        }

        return url
    }
}

if (window.Quill) {
    window.Quill.register('modules/magicUrl', MagicUrl);
}
