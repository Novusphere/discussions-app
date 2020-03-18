import Quill from 'quill'

const Embed = Quill.import('blots/embed')

class Hashtag extends Embed {
    static create(value) {
        let node = super.create(value)
        let _value = value

        const checkValueRegexResult = _value.match(/([a-zA-Z0-9_])+/i)

        if (value !== '#' && checkValueRegexResult && checkValueRegexResult.length) {
            _value = `/tag/${checkValueRegexResult[0]}`
            node.setAttribute('href', _value)
            node.setAttribute('spellcheck', false)
            node.textContent = '#' + value
            return node
        }
    }

    static formats(domNode) {
        return domNode.getAttribute('href').substr(this.BASE_URL.length)
    }

    format(name, value) {
        this.domNode.setAttribute('href', value)
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
