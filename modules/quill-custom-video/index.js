import { Quill } from 'react-quill'
import { nsdb } from '../../novusphere-js'
import { getYouTubeIDFromUrl } from '../../utils'

const BlockEmbed = Quill.import('blots/block/embed')
const Inline = Quill.import('blots/inline')

const VIDEO_ATTRIBUTES = ['height', 'width']

// provides a custom div wrapper around the default Video blot
export class Video extends BlockEmbed {
    static blotName = 'video'
    static className = 'ql-video-wrapper'
    static tagName = 'Video'

    // static async create(value) {
    //     let node = super.create()
    //
    //     if (value.indexOf('youtube') !== -1) {
    //         const id = getYouTubeIDFromUrl(value)
    //         const data = await nsdb.cors(
    //             `https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${id}`
    //         )
    //
    //         node.innerHTML = data.html
    //         console.log(node)
    //         return node
    //     }
    //
    //     return node
    // }

    static create(value) {
        const node = super.create(value);
        node.setAttribute('src', value);
        node.setAttribute('width', '100%');
        node.setAttribute("controls","controls");
        return node;
    }

    static value(node) {
        return node.getAttribute('src');
    }
}

Quill.register(Video, true)

export default Video
