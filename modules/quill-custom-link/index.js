import { Quill } from 'react-quill'
import { getYouTubeIDFromUrl } from '../../utils'
import { nsdb } from '../../novusphere-js'

const BlockEmbed = Quill.import('blots/block/embed')


// provides a custom div wrapper around the default Video blot
export class Link extends BlockEmbed {
    static blotName = 'link'
    static tagName = 'a'

    static create(value) {
        console.log('value: ', value)
        let node = super.create(value)
        node.setAttribute('href', value);
        node.innerHTML = value
        return node
    }

    static value(node) {
        return node.getAttribute('href')
    }
}

Quill.register(Link, true)

export default Link
