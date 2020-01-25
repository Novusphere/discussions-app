import Router from 'next/router'
import { discussions, eos, nsdb, Post } from '@novuspherejs'
import { IPost } from '@stores/postsStore'
import _ from 'lodash'
import axios from 'axios'
import ecc from 'eosjs-ecc'
import { useEffect, useRef } from 'react'

const removeMd = require('remove-markdown')

const pjson = require('../package.json')
const uuid = require('uuidv4')

export * from './useScrollPosition'

export const INDEXER_NAME = '__LINKINDEXER__'
export const LINK_LIMIT = 1000
export const isDev = process.env.NODE_ENV === 'development'
export const isServer = typeof window === 'undefined'
export const sleep = milliseconds => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export const sanityCheckTag = (tagName: string) => {
    const match = tagName.match(/([A-Z])\w+/gi)

    if (match && match.length) {
        return match[0]
    }

    return tagName
}

export const tweetCurrentPage = () => {
    window.open(
        'https://twitter.com/share?url=' +
            encodeURIComponent(window.location.href) +
            '&text=' +
            document.title,
        '',
        'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600'
    )
    return false
}

export const removeMD = (md: string) => {
    return removeMd(md)
}

export const getBaseUrl = () => {
    return window.location.origin
}

export const getPermaLink = (path: string, uuid: string) => {
    return `${path}#${uuid}`
}

export const generateUuid = () => {
    return uuid()
}

export const getAttachmentValue = (post: any) => {
    const value = post.hash
    const type = post.urlType
    const display = post.hash
    const trust_provider = post.txidType

    return {
        value,
        display,
        trust_provider,
        type,
    }
}

export function waitForObject(o, withObject, tries = 30) {
    let obj = o()
    if (obj && withObject) {
        withObject(obj)
    } else if (tries > 0) {
        setTimeout(() => waitForObject(o, withObject, tries - 1), 1000)
    }
}

export const openInNewTab = (url: string) => {
    const win = window.open(url, '_blank')
    return win.focus()
}

export const encodeId = (post: IPost) => {
    return Post.encodeId(post.transaction, new Date(post.createdAt))
}

export const getThreadTitle = post => {
    return decodeURIComponent(_.snakeCase(post.title))
}

export const getThreadUrl = async (post, permalinkUuid?: string) => {
    const id = encodeId(post)
    let url = `/tag/${post.sub}/${id}/`

    // if a post is a comment not a opening post
    if (post.title === '') {
        const thread = await discussions.getThread(id, '')
        const newId = encodeId(thread.openingPost as any)
        url = `/tag/${thread.openingPost.sub}/${newId}/${getThreadTitle(thread)}`
    } else {
        url += `${getThreadTitle(post)}`
    }

    if (permalinkUuid) {
        url += `#${permalinkUuid}`
    }

    return url
}

export const pushToThread = async (post, permalinkUuid?: string) => {
    const url = await getThreadUrl(post, permalinkUuid)
    Router.push('/tag/[name]/[id]/[title]', url)
}

export const getVersion = () => {
    return pjson.version
}

// TODO: Hash has to be A hexadecimal string of 15+ characters that will be used to generate the image.
export const getIdenticon = (hexaString = 'd3b07384d113edec49eaa6238ad5ff00') => {
    if (!hexaString || hexaString === '') return getDefaultIdenticon
    return `https://atmosdb.novusphere.io/discussions/keyicon/${hexaString}`
    // return new Identicon(hexaString, 420).toString()
}

export const getDefaultIdenticon = `https://atmosdb.novusphere.io/discussions/keyicon/d3b07384d113edec49eaa6238ad5ff00\``

export const defaultSubs = [
    {
        name: 'uxfyre',
        url: '/tag/uxfyre',
        logo: 'https://miro.medium.com/fit/c/256/256/1*dvVPDFC1GvXfYvnL0RJjeQ.png',
    },
    {
        name: 'airdropsdac',
        url: '/tag/airdropsdac',
        logo: 'https://i.imgur.com/slFjjhH.png',
    },
    {
        name: 'anon-pol-econ',
        url: '/tag/anon-pol-econ',
        logo: 'https://cdn.novusphere.io/static/atmos2.png',
    },
    {
        name: 'anon-r-eos',
        url: '/tag/anon-r-eos',
        logo: 'https://spee.ch/6/eos3.png',
    },
    {
        name: 'anoxio',
        url: '/tag/anoxio',
        logo: 'https://i.imgur.com/iyXIxLv.png',
    },
    {
        name: 'atticlab',
        url: '/tag/atticlab',
        logo: 'https://pbs.twimg.com/profile_images/1083303049957908480/NPv7U6HD_400x400.jpg',
    },
    {
        name: 'betking',
        url: '/tag/betking',
        logo: 'https://ndi.340wan.com/eos/betkingtoken-bkt.png',
    },
    {
        name: 'boid',
        url: '/tag/boid',
        logo: 'https://ndi.340wan.com/eos/boidcomtoken-boid.png',
    },
    {
        name: 'boscore',
        url: '/tag/boscore',
        logo: 'https://pbs.twimg.com/profile_images/1077236550377836544/5xkN5oxQ_400x400.jpg',
    },
    {
        name: 'bounties',
        url: '/tag/bounties',
        logo: 'https://spee.ch/f/MesaggingLine-08-512.png',
    },
    {
        name: 'catchthefrog',
        url: '/tag/catchthefrog',
        logo: 'https://ndi.340wan.com/image/frogfrogcoin-frog.png',
    },
    {
        name: 'cryptolions1',
        url: '/tag/cryptolions1',
        logo: 'https://cryptolions.io/assets/images/favicon.png',
    },
    {
        name: 'dabble',
        url: '/tag/dabble',
        logo: 'https://ndi.340wan.com/image/eoscafekorea-dab.png',
    },
    {
        name: 'diceone',
        url: '/tag/diceone',
        logo: 'https://pbs.twimg.com/profile_images/1072900881123692544/jcJqAEKd_400x400.jpg',
    },
    {
        name: 'dmail',
        url: '/tag/dmail',
        logo: 'https://i.imgur.com/AEbd9jX.png',
    },
    {
        name: 'effectai',
        url: '/tag/effectai',
        logo:
            'https://s3-eu-west-1.amazonaws.com/prd-effectai-website/wp-content/uploads/2019/02/14110343/logo-menu2.png',
    },
    {
        name: 'emanate',
        url: '/tag/emanate',
        logo: 'https://s3-ap-southeast-2.amazonaws.com/emanate.live/airdrop/img/favicon.png',
    },
    {
        name: 'enumivo',
        url: '/tag/enumivo',
        logo: 'https://assets.coingecko.com/coins/images/5043/large/enumivo-logo.jpg?1547040458',
    },
    {
        name: 'eos',
        url: '/tag/eos',
        logo: 'https://spee.ch/6/eos3.png',
    },
    {
        name: 'eoscafe',
        url: '/tag/eoscafe',
        logo: 'https://spee.ch/a/mBI3blJ5400x400.jpg',
    },
    {
        name: 'eoscanadacom',
        url: '/tag/eoscanadacom',
        logo: 'https://www.eoscanada.com/hubfs/eos-canada-logo-square-256px.png',
    },
    {
        name: 'eosdac',
        url: '/tag/eosdac',
        logo: 'https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/logos/eosdac.jpg',
    },
    {
        name: 'eosforce',
        url: '/tag/eosforce',
        logo: 'https://i.imgur.com/syBUWFJ.jpg',
    },
    {
        name: 'eoshash',
        url: '/tag/eoshash',
        logo: 'https://ndi.340wan.com/image/eoshashcoins-hash.png',
    },
    {
        name: 'eoslynx',
        url: '/tag/eoslynx',
        logo: 'https://i.imgur.com/ifbwqkV.png',
    },
    {
        name: 'eosnation',
        url: '/tag/eosnation',
        logo:
            'https://cdn.steemitimages.com/DQmQ3iK5GZLomDzeNQVd54PUKzEtoRG4dp5aJXd8BtVSUaW/eosnation.png',
    },
    {
        name: 'eosnewyork',
        url: '/tag/eosnewyork',
        logo: 'https://i.imgur.com/8ZHAn7N.png',
    },
    {
        name: 'eosswedenorg',
        url: '/tag/eosswedenorg',
        logo: 'https://eossweden.se/wp-content/uploads/2018/06/Square-Leaf-Banner-Wt-bkg-256.png',
    },
    {
        name: 'eostribeprod',
        url: '/tag/eostribeprod',
        logo: 'https://s3.amazonaws.com/eostribe/eos-tribe-logo-square-256px.png',
    },
    {
        name: 'eosvenezuela',
        url: '/tag/eosvenezuela',
        logo: 'https://ndi.340wan.com/image/cryptopesosc-pso.png',
    },
    {
        name: 'eoswriterio',
        url: '/tag/eoswriterio',
        logo: 'https://spee.ch/@bigbluewhale:7/EOSwriter-Site-Icon.png',
    },
    {
        name: 'escapeteamgame',
        url: '/tag/escapeteamgame',
        logo: 'https://spee.ch/4/escapeteamgamelogo.png',
    },
    {
        name: 'eva',
        url: '/tag/eva',
        logo: 'https://spee.ch/5/logooo.jpg',
    },
    {
        name: 'everipedia',
        url: '/tag/everipedia',
        logo: 'https://ndi.340wan.com/image/everipediaiq-iq.png',
    },
    {
        name: 'faq',
        url: '/tag/faq',
        logo: 'https://cdn.novusphere.io/static/atmos2.png',
    },
    {
        name: 'franceos',
        url: '/tag/franceos',
        logo: 'https://www.franceos.fr/wp-content/uploads/2018/07/franceos-logo-256x256.png',
    },
    {
        name: 'general',
        url: '/tag/general',
        logo: 'https://cdn.novusphere.io/static/atmos2.png',
    },
    {
        name: 'genereos',
        url: '/tag/genereos',
        logo: 'https://ndi.340wan.com/image/poormantoken-poor.png',
    },
    {
        name: 'infiniverse',
        url: '/tag/infiniverse',
        logo: 'https://ndi.340wan.com/eos/infinicoinio-inf.png',
    },
    {
        name: 'instar',
        url: '/tag/instar',
        logo: 'https://i.imgur.com/748dLEP.png',
    },
    {
        name: 'itamgames',
        url: '/tag/itamgames',
        logo: 'https://spee.ch/0/logoaoe.jpg',
    },
    {
        name: 'karma',
        url: '/tag/karma',
        logo: 'https://ndi.340wan.com/image/therealkarma-karma.png',
    },
    {
        name: 'liquiddapps',
        url: '/tag/liquiddapps',
        logo: 'https://spee.ch/7/BxrRkQ6v400x400.jpeg',
    },
    {
        name: 'lumeos',
        url: '/tag/lumeos',
        logo:
            'https://cdn.steemitimages.com/DQmWGk4D33Cg7fRNwbDZnkEN42jnpu13a2A1UJHCLx3w8aR/pDMcrrlh_400x400.jpg',
    },
    {
        name: 'meetone',
        url: '/tag/meetone',
        logo: 'https://ndi.340wan.com/eos/eosiomeetone-meetone.png',
    },
    {
        name: 'metalpackagingtoken',
        url: '/tag/metalpackagingtoken',
        logo: 'https://spee.ch/e/IMG5888.jpeg',
    },
    {
        name: 'mothereos',
        url: '/tag/mothereos',
        logo: 'https://spee.ch/8/logomothereos.jpg',
    },
    {
        name: 'newdex',
        url: '/tag/newdex',
        logo: 'https://ndi.340wan.com/image/newdexissuer-ndx.png',
    },
    {
        name: 'novusphere',
        url: '/tag/novusphere',
        logo: 'https://cdn.novusphere.io/static/atmos2.png',
    },
    {
        name: 'onessus',
        url: '/tag/onessus',
        logo: 'https://avatars0.githubusercontent.com/u/32319680?s=200&v=4',
    },
    {
        name: 'parsl',
        url: '/tag/parsl',
        logo: 'https://ndi.340wan.com/eos/parslseed123-seed.png',
    },
    {
        name: 'patreos',
        url: '/tag/patreos',
        logo: 'https://cdn.novusphere.io/static/atmos2.png',
    },
    {
        name: 'peosone',
        url: '/tag/peosone',
        logo: 'https://ndi.340wan.com/eos/thepeostoken-peos.png',
    },
    {
        name: 'pixeos',
        url: '/tag/pixeos',
        logo: 'https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/logos/pixeos.png',
    },
    {
        name: 'prospectors',
        url: '/tag/prospectors',
        logo: 'https://ndi.340wan.com/eos/prospectorsg-pgl.png',
    },
    {
        name: 'publyto',
        url: '/tag/publyto',
        logo: 'https://www.publyto.io/img/logo.svg',
    },
    {
        name: 'rex',
        url: '/tag/rex',
        logo: 'https://i.imgur.com/2VQutI7.png',
    },
    {
        name: 'rovegas',
        url: '/tag/rovegas',
        logo: 'https://ndi.340wan.com/image/eosvegascoin-mev.png',
    },
    {
        name: 'scatter',
        url: '/tag/scatter',
        logo: 'https://ndi.340wan.com/eos/ridlridlcoin-ridl.png',
    },
    {
        name: 'sense',
        url: '/tag/sense',
        logo: 'https://spee.ch/d/sense-token-icon-1.png',
    },
    {
        name: 'stakemine',
        url: '/tag/stakemine',
        logo: 'https://spee.ch/1/logostakemine.png',
    },
    {
        name: 'steem',
        url: '/tag/steem',
        logo:
            'https://spee.ch/5/steem-sign-2a02004c5ed4bbbae7600a370d34c18ea850de11f237815f2b6037745cf2db3a.png',
    },
    {
        name: 'steemit',
        url: '/tag/steemit',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Steemit_New_Logo.png',
    },
    {
        name: 'switcheo',
        url: '/tag/switcheo',
        logo: 'https://i.imgur.com/6I3Q8bB.png',
    },
    {
        name: 'teameos',
        url: '/tag/teameos',
        logo: 'https://spee.ch/@bigbluewhale:7/photo2019-05-0916-44-28.jpg',
    },
    {
        name: 'teamgreymass',
        url: '/tag/teamgreymass',
        logo: 'https://greymass.com/greymass_logo_256X256.png',
    },
    {
        name: 'telos',
        url: '/tag/telos',
        logo: 'https://i.imgur.com/xPgXVwp.png',
    },
    {
        name: 'test',
        url: '/tag/test',
        logo: 'https://cdn.novusphere.io/static/atmos2.png',
    },
    {
        name: 'travel',
        url: '/tag/travel',
        logo:
            'https://cdn2.iconfinder.com/data/icons/location-map-simplicity/512/travel_agency-512.png',
    },
    {
        name: 'trybe',
        url: '/tag/trybe',
        logo: 'https://ndi.340wan.com/eos/trybenetwork-trybe.png',
    },
    {
        name: 'unlimitedtower',
        url: '/tag/unlimitedtower',
        logo:
            'https://spee.ch/c7956468ab7217f0e6b3b2bce43c752b947b4804/01267215-1f25-4847-b278-c60d1daec24a.jpeg?7eb2da6fc48240cd96561a7ca2553752b6dfb5ebde614845e3a1f727db40512b:0',
    },
    {
        name: 'whaleshares',
        url: '/tag/whaleshares',
        logo: 'https://spee.ch/d/3c6d93df736e77c4df4bbc3c89f532c5cbac1621.png',
    },
    {
        name: 'worbli',
        url: '/tag/worbli',
        logo: 'https://miro.medium.com/max/2400/1*8LqCOymuRAzLp4SFhj-T_Q.png',
    },
]

export const bkToStatusJson = async (
    bk: string,
    username: string,
    password: string,
    status: any
): Promise<string> => {
    try {
        return await discussions.bkToStatusJson(bk, username, password, status)
    } catch (error) {
        return error
    }
}

export const GA_TRACKING_ID = 'UA-152897893-1'

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = url => {
    ;(window as any).gtag('config', GA_TRACKING_ID, {
        page_path: url,
    })
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
    ;(window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    })
}

// ombed stuff
export const getYouTubeIDFromUrl = url => {
    const regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/
    const match = url.match(regExp)

    if (match) {
        return match[1]
    }

    return null
}

export const allowedHosts = [
    'youtube.com',
    'youtu.be',
    'imgur.com',
    'twitter.com',
    't.me',
    'medium.com',
    'instagram.com',
    'instagr.am',
    'facebook.com',
    'fb.com',
    'fb.me',
    'api.d.tube',
    'soundcloud.com',
    'reddit.com',
    'trybe.one',
    'steemit.com',
    'medium.com',
    'whaleshares.io',
]

export const refreshOEmbed = () => {
    setTimeout(() => {
        window['twttr'].widgets.load()
        window['imgurEmbed'].createIframe()
    }, 500)
}

export const getHost = url => {
    if (url.indexOf('magnet:') == 0) {
        return 'magnet link'
    }
    const parser = document.createElement('a')
    parser.href = url
    return parser.host.toLowerCase()
}

export const checkIfNameIsValid = async (accountName: string): Promise<boolean> => {
    try {
        const { data } = await axios.post(
            'https://eos.eoscafeblock.com/v1/chain/get_table_by_scope',
            {
                code: 'eosio',
                table: 'userres',
                lower_bound: accountName,
                upper_bound: accountName,
                limit: 1,
            }
        )

        if (data.rows.length > 0) return true
        throw new Error(`${accountName} is not a valid EOS username, please try again.`)
    } catch (error) {
        throw new Error(`${accountName} is not a valid EOS username, please try again.`)
    }
}

export const trimAddress = (address: string) => {
    const first = address.slice(0, address.length / 3)
    const last = address.slice(address.length - 4, address.length)
    return `${first}...${last}`
}

export const submitRelayAsync = async (transfers: any[]) => {
    try {
        const { data } = await axios.post(
            'https://atmosdb.novusphere.io/unifiedid/relay',
            `data=${encodeURIComponent(JSON.stringify({ transfers }))}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        )

        return data
    } catch (error) {
        throw error
    }
}

export const voteAsync = async ({ voter, uuid, value, nonce, pub, sig }) => {
    try {
        const { data } = await axios.post(
            `${nsdb.api}/discussions/vote`,
            `data=${encodeURIComponent(
                JSON.stringify({
                    voter,
                    uuid,
                    value,
                    metadata: JSON.stringify({ nonce, pub, sig }),
                })
            )}`
        )
        return data
    } catch (error) {
        throw error
    }
}

export const transformTipsToTransfers = (
    tips: any[],
    replyingToUIDW: string,
    privateKey: string,
    tokens: any[]
) => {
    return tips.map(tip => {
        let symbol = tip.symbol.toUpperCase()

        // find token to get chain and contract
        let token = tokens.find(t => t.label === symbol)

        if (token) {
            const {
                label,
                decimals,
                chain: _chain,
                fee: { flat, percent },
            } = token

            const chain = parseInt(String(_chain))
            const from = ecc.privateToPublic(privateKey)
            const nonce = new Date().getTime()
            const amountasNumber = Number(tip.amount)
            const totalFee = amountasNumber * percent + flat
            const amount = `${Number(tip.amount - totalFee).toFixed(decimals)} ${label}`
            const fee = `${Number(totalFee).toFixed(decimals)} ${label}`
            const memo = ''

            let to = replyingToUIDW

            if (tip.username) {
                const [, , uidwFromUrl] = tip.url.split('-')

                if (uidwFromUrl) {
                    to = uidwFromUrl
                }
            }

            const sig = eos.transactionSignature(chain, privateKey, to, amount, fee, nonce, memo)

            return {
                chain,
                from,
                to,
                amount,
                fee,
                nonce,
                memo,
                sig,
            }
        }
    })
}

export const generateVoteObject = ({ uuid, postPriv, value }) => {
    const pub = ecc.privateToPublic(postPriv)
    const nonce = new Date().getTime()
    const hash0 = ecc.sha256(`${value} ${uuid} ${nonce}`)
    const sig = ecc.sign(hash0, postPriv)

    return {
        pub,
        sig,
        nonce,
        data: {
            voter: '',
            uuid: uuid,
            value: value,
            metadata: JSON.stringify({
                nonce: nonce,
                pub: pub,
                sig: sig,
            }),
        },
    }
}

export const useInterval = (callback, delay) => {
    const savedCallback = useRef()

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    // Set up the interval.
    useEffect(() => {
        const tick = () => {
            // @ts-ignore
            savedCallback.current()
        }

        if (delay !== null) {
            let id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}
