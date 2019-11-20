import { Quill } from 'react-quill'
import { nsdb } from '../../novusphere-js'

const BlockEmbed = Quill.import('blots/block/embed')
const Inline = Quill.import('blots/inline');

const VIDEO_ATTRIBUTES = ['height', 'width']

// provides a custom div wrapper around the default Video blot
export class Video extends Inline {
    static async create(value) {
        let node = super.create()

        if (value.indexOf('youtube') !== -1) {

            const { data } = await nsdb.cors(`https://www.youtube.com/oembed?format=json&url=${value}`)

            console.log(data)

            // node.setInnerHtml = json.html

            return node
        }

        return null
    }

    // static formats(domNode) {
    //     const iframe = domNode.getElementsByTagName('iframe')[0]
    //     return VIDEO_ATTRIBUTES.reduce(function(formats, attribute) {
    //         if (iframe.hasAttribute(attribute)) {
    //             formats[attribute] = iframe.getAttribute(attribute)
    //         }
    //         return formats
    //     }, {})
    // }

    static value(domNode) {
        console.log(domNode)

        return domNode
        // const node = domNode.getElementsByTagName('iframe')[0]
        //
        // console.log(node)
        //
        // if (node) {
        //     return node.getAttribute('src')
        // }
        //
        // return null
    }

    // format(name, value) {
    //     if (VIDEO_ATTRIBUTES.indexOf(name) > -1) {
    //         if (value) {
    //             this.domNode.setAttribute(name, value)
    //         } else {
    //             this.domNode.removeAttribute(name)
    //         }
    //     } else {
    //         super.format(name, value)
    //     }
    // }
}

Video.blotName = 'video'
Video.className = 'ql-video-wrapper'
Video.tagName = 'iframe'

Quill.register(Video, true)

export default Video
