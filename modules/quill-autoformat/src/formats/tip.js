import Quill from 'quill'

const Embed = Quill.import('blots/embed')

class Tip extends Embed {
    static create(value) {
        console.log(value)
        let node = super.create(value)
        // node.setAttribute('href', `https://beta.discussions.app/tags/${value}`)
        // node.setAttribute('spellcheck', false)
        // node.textContent = '#tip' + value
        return node
    }

    static formats(domNode) {
        return domNode.getAttribute('href').substr(this.BASE_URL.length)
    }

    format(name, value) {
        this.domNode.setAttribute('href', this.BASE_URL + value)
    }

    static value(domNode) {
        console.log('textContent: ', domNode.textContent)
        return domNode.textContent.substr(1)
    }
}

Tip.blotName = 'tip'
Tip.className = 'ql-tip'
Tip.tagName = 'A'
Tip.BASE_URL = '#'

export { Tip as default }
