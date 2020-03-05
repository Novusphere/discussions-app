import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
// @ts-ignore
import Markdown from 'markdown-to-jsx'
// @ts-ignore
import { LazyLoadImage } from 'react-lazy-load-image-component'
import cx from 'classnames'

import styles from './RichTextPreview.module.scss'
import { nsdb } from '@novuspherejs'
import { generateUuid, LINK_LIMIT, openInNewTab, refreshOEmbed } from '@utils'

interface IRichTextPreviewProps {
    hideFade?: boolean
    className?: string
}

const RtLink: FunctionComponent<any> = ({ children, href, index }) => {
    const [getEmbed, setEmbed] = useState(null)

    useEffect(() => {
        async function getOEMBED() {
            let embed

            try {
                switch (true) {
                    case /https?:\/\/(www\.)?(facebook|fb).(com|me)\/.+/.test(href):
                        embed = `<div class="fb-post" data-href="${href}"></div>`
                        break
                    case /bitchute/.test(href):
                        const [, id] = href.split('bitchute.com/video/')
                        embed = `<iframe width="560px" height="315px" src="https://www.bitchute.com/embed/${id}" frameborder="0" />`
                        break
                    case /https?:\/\/www.youtube.com\/watch\?feature=(.*?)&v=[a-zA-Z0-9-_]+/.test(
                        href
                    ):
                    case /https?:\/\/www.youtube.com\/watch\?v=[a-zA-Z0-9-_]+/.test(href):
                    case /https?:\/\/youtu.be\/[a-zA-Z0-9-_]+/.test(href):
                        embed = await nsdb.cors(
                            `https://www.youtube.com/oembed?format=json&url=${href.replace(
                                /feature=(.*?)&/,
                                ''
                            )}`
                        )
                        break
                    case /https?:\/\/www.imgur.com(\/[a-zA-Z0-9-_]+)?\/p\/[a-zA-Z0-9-_]+(\/?.+)?/.test(
                        href
                    ):
                        embed = await nsdb.cors(`https://api.imgur.com/oembed.json?url=${href}`)
                        break
                    case /https?:\/\/twitter.com\/[a-zA-Z0-9-_]+\/status\/[0-9]+/.test(href):
                        embed = await nsdb.cors(`https://publish.twitter.com/oembed?url=${href}`)
                        break
                    case /d.tube/.test(href):
                        embed = await nsdb.cors(`https://api.d.tube/oembed?url=${href}`)
                        break
                    case /soundcloud/.test(href):
                        embed = await nsdb.cors(
                            `https://soundcloud.com/oembed?format=json&url=${href}`
                        )
                        break
                    case /https?:\/\/www.instagr.am(\/[a-zA-Z0-9-_]+)?\/p\/[a-zA-Z0-9-_]+(\/?.+)?/.test(
                        href
                    ):
                    case /https?:\/\/www.instagram.com(\/[a-zA-Z0-9-_]+)?\/p\/[a-zA-Z0-9-_]+(\/?.+)?/i.test(
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
                                <a
                                    href={href}
                                    className={'pointer'}
                                    onClick={() => openInNewTab(href)}
                                    title={'Open image in new tab'}
                                >
                                    <LazyLoadImage alt={'Viewing image'} src={href} effect="blur" />
                                </a>
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
            } catch (error) {
                embed = 'This content is unavailable'
            }
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

        let timeout: any = null

        timeout = setTimeout(() => {
            refreshOEmbed()
        }, 250)

        return () => {
            notDone = false

            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }, [])

    useEffect(() => {}, [])

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
            className={cx([styles.rtObject, 'center'])}
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
    const renderMarkdown = useCallback(
        () => (
            <Markdown
                options={{
                    overrides: {
                        a: {
                            component: RtLink,
                        },
                        // blockquote: {
                        //     component: ({ children }: any) => (
                        //         <span className={'db pl3 bw2 bl b--light-gray'}>{children}</span>
                        //     ),
                        // },
                        h1: {
                            component: ({ children }: any) => (
                                <span className={'f4 b'}>{children}</span>
                            ),
                        },
                        h2: {
                            component: ({ children }: any) => (
                                <span className={'f5 b'}>{children}</span>
                            ),
                        },
                    },
                }}
            >
                {children}
            </Markdown>
        ),
        [children]
    )

    return (
        <div
            className={cx('pt0 pb3', styles.richTextPreview, [
                {
                    'black lh-copy measure-wide pt0 overflow-break-word': !className,
                    [className]: !!className,
                },
            ])}
        >
            <div
                className={cx([
                    {
                        [styles.contentFade]: !hideFade,
                    },
                ])}
            >
                {renderMarkdown()}
            </div>
        </div>
    )
}

RichTextPreview.defaultProps = {
    hideFade: false,
}

export default RichTextPreview
