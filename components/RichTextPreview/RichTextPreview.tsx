import React, { FunctionComponent, useEffect, useState } from 'react'
import Markdown from 'markdown-to-jsx'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import cx from 'classnames'

import styles from './RichTextPreview.module.scss'
import { nsdb } from '@novuspherejs'
import { generateUuid, LINK_LIMIT, openInNewTab } from '@utils'

interface IRichTextPreviewProps {
    hideFade?: boolean
    className?: string
}

const RtLink: FunctionComponent<any> = ({ children, href, index }) => {
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
                case /https:\/\/www.youtube.com\/watch\?feature=youtu.be&v=[a-zA-Z0-9-_]+/.test(
                    href
                ):
                    // parse feature=youtu.be
                    embed = await nsdb.cors(
                        `https://www.youtube.com/oembed?format=json&url=${href.replace(
                            'feature=youtu.be&',
                            ''
                        )}`
                    )
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
                case /https?:\/\/(www.)?tradingview.com\/x\//.test(href):
                case /(.|)http[s]?:\/\/(\w|[:\/.%-])+\.(png|jpg|jpeg|gif)(\?(\w|[:\/.%-])+)?(.|)/.test(
                    href
                ):
                    // embed = `<img src="${href}" alt="Viewing image" />`
                    embed = {
                        html: (
                            <span
                                className={'pointer'}
                                onClick={() => openInNewTab(href)}
                                title={'Open image in new tab'}
                            >
                                <LazyLoadImage alt={'Viewing image'} src={href} effect="blur" />
                            </span>
                        ),
                    }
                    break
                case /t.me\/([a-zA-Z0-9\_\!\@\+]+)\/([a-zA-Z0-9]+)/.test(href):
                    const [, ids] = href.split('t.me/')
                    if (ids) {
                        embed = `<span data-telegram-rn="${generateUuid()}" data-telegram-post="${ids}" data-width="100%"></span>`
                    }
                    break
                default:
                    embed = null
                    break
            }

            return embed
        }

        let notDone = true

        getOEMBED().then(embed => {
            if (notDone && embed) {
                if (embed['html']) {
                    setEmbed(embed['html'])
                } else if (embed['body']) {
                    setEmbed(embed['body'])
                } else {
                    setEmbed(embed)
                }
            }
        })

        let timeout = null

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

                timeout = setTimeout(() => {
                    tl.default(window)
                }, 0)
            }
        }

        refreshIFrames()

        return () => {
            if (timeout) {
                clearTimeout(timeout)
            }
            notDone = false
        }
    }, [])

    if (!getEmbed || index > LINK_LIMIT) {
        return (
            <object>
                <a data-indexer-set="true" data-index={index} href={href} title={`Open ${href}`}>
                    <object>{children}</object>
                </a>
            </object>
        )
    }

    if (getEmbed.hasOwnProperty('$$typeof')) {
        return getEmbed
    }

    return (
        <object
            className={'rt-object'}
            data-index={index}
            dangerouslySetInnerHTML={{ __html: getEmbed }}
        />
    )
}

const RichTextPreview: FunctionComponent<IRichTextPreviewProps> = ({
    hideFade,
    children,
    className,
}) => {
    return (
        <div
            className={cx('pt0 pb3', [
                {
                    [styles.contentFade]: !hideFade,
                    'black lh-copy measure-wide pt0 overflow-break-word': !className,
                    [className]: !!className,
                },
            ])}
        >
            <Markdown
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
        </div>
    )
}

RichTextPreview.defaultProps = {
    hideFade: false,
}

export default RichTextPreview
