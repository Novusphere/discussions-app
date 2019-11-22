import { Quill } from 'react-quill'
import { getYouTubeIDFromUrl } from '../../utils'
import { nsdb } from '../../novusphere-js'

const BlockEmbed = Quill.import('blots/block/embed')

export const RichEmbedFilters = [
    {
        // youtube
        match: /https:\/\/youtu.be\/[a-zA-Z0-9-_]+/gi,
    },
    {
        // youtube 2
        match: /https:\/\/www.youtube.com\/watch\?v=[a-zA-Z0-9-_]+/gi,
    },
    {
        match: /https:\/\/twitter.com\/[a-zA-Z0-9-_]+\/status\/[0-9]+/gi,
    },
    {
        match: /https:\/\/t.me\/[\w]+\/[0-9]+/gi,
    },
    {
        match: /https:\/\/medium.com\/@[\w]+\/.+/gi,
    },
    {
        match: /https:\/\/www.instagram.com(\/[a-zA-Z0-9-_]+)?\/p\/[a-zA-Z0-9-_]+(\/?.+)?/gi,
    },
    {
        match: /https:\/\/www.instagr.am(\/[a-zA-Z0-9-_]+)?\/p\/[a-zA-Z0-9-_]+(\/?.+)?/gi,
    },
    {
        match: /https?:\/\/(www\.)?(facebook|fb).(com|me)\/.+/gi,
    },
]

// provides a custom div wrapper around the default Video blot
export class Video extends BlockEmbed {
    static blotName = 'video'
    static className = 'ql-video-wrapper'
    static tagName = 'iframe'

    static create(value) {
        let node = super.create(value)

        if (value.search(/youtube|youtu.be/) !== -1) {
            const id = getYouTubeIDFromUrl(value)

            nsdb.cors(
                `https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${id}`
            ).then(data => {
                node.outerHTML = data['html']
            })
        }

        return node
    }

    static value(node) {
        return node.getAttribute('src')
    }
}

Quill.register(Video, true)

export default Video
