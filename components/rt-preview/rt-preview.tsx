import * as React from 'react'
import Markdown from 'markdown-to-jsx'

import './style.scss'
import { useEffect, useState } from 'react'
import { nsdb } from '@novuspherejs'
import classNames from 'classnames'

interface IRtPreviewProps {
    className?: string
}

const RtLink = ({ children, href }) => {
    const [getEmbed, setEmbed] = useState(null)

    useEffect(() => {
        async function getOEMBED() {
            let embed

            if (href.match(/youtube|youtu.be/)) {
                embed = await nsdb.cors(`https://www.youtube.com/oembed?format=json&url=${href}`)
            } else if (href.match(/imgur/)) {
                embed = await nsdb.cors(`https://api.imgur.com/oembed.json?url=${href}`)
            } else if (href.match(/twitter.com\/(.*)\/status/)) {
                embed = await nsdb.cors(`https://publish.twitter.com/oembed?url=${href}`)
            } else if (href.match(/d.tube/)) {
                embed = await nsdb.cors(`https://api.d.tube/oembed?url=${href}`)
            } else if (href.match(/soundcloud/)) {
                embed = await nsdb.cors(`https://soundcloud.com/oembed?format=json&url=${href}`)
            } else if (href.match(/instagram/)) {
                embed = await nsdb.cors(`https://api.instagram.com/oembed/?url=${href}`)
            } else if (href.match(/twitter/)) {
                embed = await nsdb.cors(
                    `https://db.novusphere.io/service/cors/?https://publish.twitter.com/oembed?url=${href}`
                )
            } else {
                embed = `<a href="${href}" title="Open ${href}">${children}</a>`
            }

            if (embed['html']) {
                setEmbed(embed['html'])
            } else if (embed['body']) {
                setEmbed(embed['body'])
            } else {
                setEmbed(embed)
            }
        }

        function refreshIFrames() {
            if (href.match(/facebook|fb.me/)) {
                if ((window as any).FB) {
                    ;(window as any).FB.XFBML.parse()
                }
            } else if (href.match(/twitter/)) {
                if (window['twttr']) {
                    window['twttr'].widgets.load()
                }
            } else if (href.match(/instagram/)) {
                if ((window as any).instgrm) {
                    ;(window as any).instgrm.Embeds.process()
                }
            }
        }

        getOEMBED()

        setTimeout(() => {
            refreshIFrames()
        }, 500)
    }, [])

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
