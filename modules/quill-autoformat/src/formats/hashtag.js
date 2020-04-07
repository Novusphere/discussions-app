import Quill from 'quill'

const Embed = Quill.import('blots/embed')

class Hashtag extends Embed {
    static create(value) {
        let node = super.create(value)
        let _value = value

        const checkValueRegexResult = _value.match(/([a-zA-Z0-9_])+/i)

        if (value !== '#' && checkValueRegexResult && checkValueRegexResult.length) {
            let tagName = checkValueRegexResult[0]

            if (tagName.indexOf('#') !== -1) {
                tagName.replace('#', '')
            }

            _value = `/tag/${tagName}`

            node.setAttribute('data-url', _value)
            node.setAttribute('href', _value)
            node.setAttribute('spellcheck', false)
            node.textContent = '#' + tagName
            return node
        }
    }

    static formats(domNode) {
        return domNode.getAttribute('data-url')
    }

    format(name, value) {
        this.domNode.setAttribute('href', this.domNode.getAttribute('data-url'))
    }

    static value(domNode) {
        return domNode.textContent.substr(1)
    }
}

Hashtag.blotName = 'hashtag'
Hashtag.className = 'ql-hashtag'
Hashtag.tagName = 'A'
Hashtag.BASE_URL = '#'

export { Hashtag as default }
