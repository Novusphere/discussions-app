import * as React from 'react'
import Markdown from 'markdown-to-jsx'

import './style.scss'
import { useEffect, useState } from 'react'
import { nsdb } from '@novuspherejs'
import classNames from 'classnames'
import { generateUuid, INDEXER_NAME, LINK_LIMIT } from '@utils'
import { useRef } from 'react'
import { useCallback } from 'react'

interface IRtPreviewProps {
    className?: string
}

const RtLink: any = ({ children, href, index }) => {
    const [getEmbed, setEmbed] = useState(null)

    let _href = href

    if (href.indexOf(INDEXER_NAME) !== -1) {
        const [_splt_href] = href.split(INDEXER_NAME)
        _href = _splt_href
    }

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
                setTimeout(() => {
                    tl.default(window)
                }, 0)
            }
        }

        refreshIFrames()
    }, [getEmbed])

    if (!getEmbed || index > LINK_LIMIT) {
        return (
            <a data-indexer-set="true" data-index={index} href={_href} title={`Open ${href}`}>
                {children}
            </a>
        )
    }

    return (
        <object
            className={'rt-object'}
            data-index={index}
            dangerouslySetInnerHTML={{ __html: getEmbed }}
        />
    )
}

const RtLinkCount = ({ href, children }) => {
    const ref = useRef(null)
    const [_href, _setHref] = useState(href)
    const [_index, _setIndex] = useState(1)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (ref.current) {
                const url = ref.current.childNodes[0].getAttribute('href')
                if (url) {
                    const split = url.split(INDEXER_NAME)

                    if (split) {
                        _setIndex(split[1])
                        _setHref(split[0])
                    }
                }
            }
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    return (
        <span ref={ref}>
            <RtLink children={children} href={_href} index={_index} />
        </span>
    )
}

const RichTextPreview: React.FC<IRtPreviewProps> = ({ children, className }) => {
    if (!children) return null

    const ref = useRef(null)
    const setRef = useCallback(node => {
        if (node) {
            const linkNodes: HTMLCollection = node.childNodes[0].getElementsByTagName('a')
            if (linkNodes.length) {
                Array.from(linkNodes).forEach((item, index) => {
                    if (!item.getAttribute('data-indexer')) {
                        item.setAttribute(
                            'href',
                            `${item.getAttribute('href')}/${INDEXER_NAME}${index + 1}`
                        )
                    }
                })
            }
        }

        ref.current = node
    }, [])

    return (
        <object
            ref={setRef}
            className={classNames('pt0 pb3', [
                {
                    'black lh-copy measure-wide pt0 post-preview-content content-fade overflow-break-word': !className,
                    [className]: !!className,
                },
            ])}
        >
            <Markdown
                options={{
                    createElement(type, props, children) {
                        if (type === 'a') {
                            return React.createElement(RtLinkCount, { ...props }, children)
                        }
                        return React.createElement(type, props, children)
                    },
                }}
            >
                {children}
            </Markdown>
        </object>
    )
}

export default RichTextPreview
