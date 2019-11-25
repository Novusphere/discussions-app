import * as React from 'react'
import Markdown from 'markdown-to-jsx'

import './style.scss'
import { useEffect, useState } from 'react'
import { nsdb } from '@novuspherejs'
import classNames from 'classnames'
import { generateUuid, waitForObject } from '@utils'

interface IRtPreviewProps {
    className?: string
}

const RtLink = ({ children, href }) => {
    const [getEmbed, setEmbed] = useState(null)

    useEffect(() => {
        async function getOEMBED() {
            let embed

            switch (true) {
                case /https?:\/\/(www\.)?(facebook|fb).(com|me)\/.+/.test(href):
                    embed = `<div class="fb-post" data-href="${href}"></div>`
                    break
                case /bitchute/.test(href):
                    const [, id] = href.split('bitchute.com/video/')
                    embed = `<iframe width="560px" height="315px" src="https://www.bitchute.com/embed/${id}" frameborder="0" />`
                    break
                case /https:\/\/www.youtube.com\/watch\?v=[a-zA-Z0-9-_]+/.test(href):
                case /https:\/\/youtu.be\/[a-zA-Z0-9-_]+/.test(href):
                    embed = await nsdb.cors(
                        `https://www.youtube.com/oembed?format=json&url=${href}`
                    )
                    break
                case /https:\/\/www.imgur.com(\/[a-zA-Z0-9-_]+)?\/p\/[a-zA-Z0-9-_]+(\/?.+)?/.test(
                    href
                ):
                    embed = await nsdb.cors(`https://api.imgur.com/oembed.json?url=${href}`)
                    break
                case /https:\/\/twitter.com\/[a-zA-Z0-9-_]+\/status\/[0-9]+/.test(href):
                    embed = await nsdb.cors(`https://publish.twitter.com/oembed?url=${href}`)
                    break
                case /d.tube/.test(href):
                    embed = await nsdb.cors(`https://api.d.tube/oembed?url=${href}`)
                    break
                case /soundcloud/.test(href):
                    embed = await nsdb.cors(`https://soundcloud.com/oembed?format=json&url=${href}`)
                    break
                case /https:\/\/www.instagr.am(\/[a-zA-Z0-9-_]+)?\/p\/[a-zA-Z0-9-_]+(\/?.+)?/.test(
                    href
                ):
                case /https:\/\/www.instagram.com(\/[a-zA-Z0-9-_]+)?\/p\/[a-zA-Z0-9-_]+(\/?.+)?/i.test(
                    href
                ):
                    embed = await nsdb.cors(`https://api.instagram.com/oembed/?url=${href}`)
                    break
                case /(.|)http[s]?:\/\/(\w|[:\/.%-])+\.(png|jpg|jpeg|gif)(\?(\w|[:\/.%-])+)?(.|)/.test(
                    href
                ):
                    embed = `<img src="${href}" alt="Viewing image" />`
                    break
                case /t.me/.test(href):
                    const [, ids] = href.split('t.me/')
                    if (ids) {
                        embed = `<span data-telegram-rn="${generateUuid()}" data-telegram-post="${ids}" data-width="100%"></span>`
                    }
                    break
                default:
                    embed = null
                    break
            }

            if (embed) {
                if (embed['html']) {
                    setEmbed(embed['html'])
                } else if (embed['body']) {
                    setEmbed(embed['body'])
                } else {
                    setEmbed(embed)
                }
            }
        }

        // async function refreshIFrames() {
        //     if (href.match(/facebook|fb.me/)) {
        //         waitForObject(() => (window as any).twttr, FB => FB.XFBML.parse())
        //     } else if (href.match(/twitter/)) {
        //         waitForObject(() => (window as any).twttr, twttr => twttr.widgets.load())
        //     } else if (href.match(/instagram/)) {
        //         waitForObject(() => (window as any).twttr, instgrm => instgrm.Embeds.process())
        //     } else if (href.match(/t.me/)) {
        //         // @ts-ignore
        //         const tl = await import('/static/telegram.js')
        //         tl.default(window)
        //     }
        // }

        getOEMBED()
    }, [])

    useEffect(() => {
        async function refreshIFrames() {
            if (href.match(/facebook|fb.me/)) {
                if ((window as any).FB) {
                    ;(window as any).FB.XFBML.parse()
                }
            } else if (href.match(/twitter/)) {
                if ((window as any).twttr) {
                    ;(window as any).twttr.widgets.load()
                }
            } else if (href.match(/instagram/)) {
                if ((window as any).instgrm) {
                    ;(window as any).instgrm.Embeds.process()
                }
            } else if (href.match(/t.me/)) {
                // @ts-ignore
                const tl = await import('/static/telegram.js')
                tl.default(window)
            }
        }

        refreshIFrames()
    }, [getEmbed])

    if (!getEmbed) {
        return (
            <a href={href} title={`Open ${href}`}>
                {children}
            </a>
        )
    }

    return <object data-href={href} dangerouslySetInnerHTML={{ __html: getEmbed }} />
}

const RtPreview: React.FC<IRtPreviewProps> = ({ children, className }) => {
    if (!children) return null

    return (
        <object className={'pv3'}>
            <Markdown
                className={classNames([
                    {
                        'black lh-copy measure-wide pt0 post-preview-content content-fade overflow-break-word': !className,
                        [className]: !!className,
                    },
                ])}
                options={{
                    overrides: {
                        a: {
                            component: RtLink,
                        },
                    },
                }}
            >
                {children}
            </Markdown>
        </object>
    )
}

export default RtPreview
