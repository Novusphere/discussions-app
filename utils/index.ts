import { discussions, eos, nsdb, Post } from '@novuspherejs'
import _ from 'lodash'
import axios from 'axios'
// @ts-ignore
import ecc from 'eosjs-ecc'

const removeMd = require('remove-markdown')
const matchAll = require('string.prototype.matchall')
const pjson = require('../package.json')
const uuid = require('uuidv4')

export * from './useInterval'
export * from './mediaQueries'

export const LINK_LIMIT = 1000
export const isDev = process.env.NODE_ENV === 'development'
export const isServer = typeof window === 'undefined'
export const sleep = (milliseconds: number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export const getSettings = async host => {
    const { data: setting } = await axios.get(`${nsdb.api}/discussions/site`)

    let settings = setting[host]

    if (typeof settings === 'undefined' || !settings) {
        settings = setting['discussions.app']
    }

    return settings
}

export const SORTER_OPTIONS = {
    popular: 'Popular',
    recent: 'Recent',
    controversial: 'Controversial',
}

export const getHostName = () => {
    if (isDev) return 'beta.discussions.app'
    return window.location.hostname
}

export const getOrigin = () => {
    if (isDev) return 'https://beta.discussions.app'
    return window.location.origin
}

export const deleteAllCookies = () => {
    const cookies = document.cookie.split(';')

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
}

export const sanityCheckTag = (tagName: string) => {
    const match = tagName.match(/([A-Z])\w+/gi)

    if (match && match.length) {
        return match[0]
    }

    return tagName
}

export const tweetCurrentPage = (url: string) => {
    window.open(
        'https://twitter.com/share?url=' +
            (url ? url : encodeURIComponent(window.location.href)) +
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

export const openInNewTab = (url: string) => {
    const win = window.open(url, '_blank')
    return win.focus()
}

export const encodeId = (post: Post) => {
    if (!post) return ''
    return Post.encodeId(post.transaction, new Date(post.createdAt))
}

export const getThreadTitle = (post: Post) => {
    if (!post.title) return ''
    return _.snakeCase(post.title.replace(/[^0-9a-z]/gi, ' '))
}

export const getThreadUrl = async (post: Post, permalinkUuid?: string) => {
    const id = encodeId(post)
    let sub = _.trim(post.sub)
    let url = `/tag/${sub}/${id}`

    // if a post is a comment not a opening post
    if (post.op) {
        url += `/${getThreadTitle(post.op)}`
    } else if (!post.op && post.title === '') {
        const thread = await discussions.getThread(id, '')
        if (!thread || !thread.openingPost) return ''
        const newId = encodeId(thread.openingPost as any)
        url = `/tag/${thread.openingPost.sub}/${newId}/${getThreadTitle(thread as any)}`
    } else {
        url += `/${getThreadTitle(post)}`
    }

    if (permalinkUuid) {
        url += `/#${permalinkUuid}`
    }

    return url
}

export const pushToThread = async (post: Post, permalinkUuid?: string) => {
    const url = await getThreadUrl(post, permalinkUuid)
    return url
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
export const pageview = (url: string) => {
    ;(window as any).gtag('config', GA_TRACKING_ID, {
        page_path: url,
    })
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: any) => {
    ;(window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    })
}

// ombed stuff
export const getYouTubeIDFromUrl = (url: string) => {
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

export const refreshOEmbed = async () => {
    if ((window as any).FB) {
        ;(window as any).FB.XFBML.parse()
    }

    if ((window as any).twttr) {
        ;(window as any).twttr.widgets.load()
    }

    if ((window as any).instgrm) {
        ;(window as any).instgrm.Embeds.process()
    }

    const tl = await import('@static/telegram.js')

    setTimeout(() => {
        tl.default(window)
    }, 0)
}

/**
 *
 * @param accountName
 * @returns {boolean} - if account name is valid/invalid
 * @returns {boolean[]} - if account name is a public key and valid/invalid
 */
export const checkIfNameIsValid = async (accountName: string): Promise<boolean | boolean[]> => {
    try {
        console.log('validating ', accountName)

        const isPublicKey = ecc.isValidPublic(accountName)

        if (isPublicKey) {
            return [isPublicKey, isPublicKey]
        }

        const { data } = await axios.get(
            `https://www.api.bloks.io/account/${accountName}?type=getAccountTokens`
        )

        if (data && data.tokens && data.tokens.length > 0) return true
        throw new Error(accountName)
    } catch (error) {
        throw new Error(accountName)
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

export const voteAsync = async ({ voter, uuid, value, nonce, pub, sig }: any) => {
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

export const transformTipToMetadata = ({
    tip,
    tokens,
    replyingToUIDW,
    replyingToDisplayName,
    replyingToPostPub,
}) => {
    let symbol = tip.symbol.toUpperCase()

    // find token to get chain and contract
    let token = tokens.find(t => t.label === symbol)

    const {
        label,
        decimals,
        chain: _chain,
        fee: { flat, percent },
    } = token

    const chain = parseInt(String(_chain))
    const nonce = new Date().getTime()
    const amountasNumber = Number(tip.amount)
    const totalFee = Number((amountasNumber * percent + flat).toFixed(decimals))
    const amount = `${Number(tip.amount - totalFee).toFixed(decimals)} ${label}`
    const fee = `${Number(totalFee).toFixed(decimals)} ${label}`
    const memo = ''

    let to = replyingToUIDW
    let postPub = replyingToPostPub
    let username = replyingToDisplayName

    if (tip.username) {
        const [usrname, postPublicKey, uidwFromUrl] = tip.url.replace('/u/', '').split('-')

        if (uidwFromUrl) {
            to = uidwFromUrl
            username = usrname
        }

        if (postPublicKey) {
            postPub = postPublicKey
        }
    }

    return {
        symbol,
        token,
        chain,
        to,
        amount,
        fee,
        nonce,
        memo,
        username,
        postPub,
    }
}

export const transformTipsToTransfers = (
    { tips, replyingToUIDW, replyingToDisplayName, replyingToPostPub, privateKey, tokens }
) => {
    return tips.map(tip => {
        let { token, chain, to, amount, fee, nonce, memo } = transformTipToMetadata({
            tip,
            tokens,
            replyingToUIDW,
            replyingToDisplayName,
            replyingToPostPub,
        })

        if (token) {
            const from = ecc.privateToPublic(privateKey)

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

export const generateVoteObject = ({ uuid, postPriv, value }: any) => {
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

export const escapeRegExp = (string: string) => {
    return string.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&') // $& means the whole matched string
}

export const matchTipForTags = (content: string) => {
    let tokens = 'ATMOS|EOS'

    if (typeof window !== 'undefined') {
        tokens = window.localStorage.getItem('supp_tokens')
    }

    // this is a fix for removing zero-width characters from a js string
    const _content = content.replace(/[\u200B-\u200D\uFEFF]/g, '')
    const regex = new RegExp(
        `\\[#tip\\](.*?)\\s([0-9\.]+)\\s(${tokens})(?:\\s\\[\\@(.*?)\\]\\((.*?)\\))?`,
        'gim'
    )

    let results = matchAll(_content, regex)
    let tips = []

    for (let result of results) {
        const [, , amount, symbol, username, url] = result

        tips.push({
            amount,
            symbol,
            username,
            url,
        })
    }

    return tips
}

export const matchContentForMentions = (content: string) => {
    return content.match(/\[@(.*?)]\(.*?\)/gi)
}

export const extractMentionHashesForRegEx = (matchedContentForMentions: any) => {
    if (!matchedContentForMentions) return []
    const regex = new RegExp(/\(?EOS.*\)?\w/, 'gi')
    return matchedContentForMentions.map((items: any) => {
        return items.match(regex)[0]
    })
}

export const matchContentForTags = (content: string) => {
    /**
     * Hashtags with underscores (_) get parsed as `\_` by turndown
     * Seems tricky to remove because unsure what it affects.
     */
    let results = matchAll(content, /\[\#([a-zA-Z0-9\\_]*)\]/gim)
    let tags = []

    for (let result of results) {
        const [, tag] = result
        const stripped = tag.replace(/\\/g, '')
        tags.push(stripped)
    }

    return tags
}

export const createPostObject = ({
    title,
    content,
    sub,
    parentUuid,
    threadUuid,
    uidw,
    pub, // the person you are replying to
    posterName,
    isEdit = false,
    skipId = false,
    postPub = '',
    postPriv = '',
    uuid = '',
}: any) => {
    let reply: any = {
        poster: null,
        title: title,
        createdAt: new Date(Date.now()),
        content: content,
        sub: sub,
        chain: 'eos',
        mentions: [],
        tags: [sub],
        id: '',
        uuid: uuid,
        parentUuid: parentUuid,
        threadUuid: threadUuid,
        uidw: uidw,
        attachment: getAttachmentValue(content),
        upvotes: 0,
        downvotes: 0,
        myVote: [],
        edit: undefined,
        transfers: [],
        vote: null,
        imageData: getIdenticon(postPub),
        pub: postPub,
        displayName: posterName,
        sig: '',
        replies: [],
    }

    if (!isEdit) {
        const generatedUuid = generateUuid()

        if (!skipId) {
            reply.id = generatedUuid
            reply.uuid = generatedUuid
        }

        const value = 1

        reply = {
            ...reply,
            upvotes: 1,
        }

        if (postPriv) {
            reply.vote = generateVoteObject({
                uuid: generatedUuid,
                postPriv: postPriv,
                value: value,
            }).data
        }

        let tips = matchTipForTags(content)

        if (tips && tips.length) {
            reply.transfers = tips
        }
    } else {
        reply.uuid = generateUuid()
        reply.edit = true
    }

    reply.mentions = [...extractMentionHashesForRegEx(matchContentForMentions(content)), pub]

    let tags = matchContentForTags(content)

    if (tags && tags.length) {
        tags = tags.map(tag => tag.replace('#', ''))
        reply.tags = [...reply.tags, ...tags]
    }

    return reply
}

export const hasErrors = (fieldsError: any) => {
    return Object.keys(fieldsError).some(field => fieldsError[field])
}

export const signPost = ({ privKey, content, uuid }: any) => {
    let pub = ecc.privateToPublic(privKey)
    const hash0 = ecc.sha256(content)
    const hash1 = ecc.sha256(uuid + hash0)
    const sig = ecc.sign(hash1, privKey)
    const verifySig = pub

    return {
        sig,
        verifySig,
    }
}

export const getSignatureAndSubmit = (robj: any, fromAddress: string) => {
    try {
        robj.sig = eos.transactionSignature(
            robj.chain,
            fromAddress,
            robj.to,
            robj.amount,
            robj.fee,
            robj.nonce,
            robj.memo
        )

        return submitRelayAsync([robj])
    } catch (error) {
        throw error
    }
}
