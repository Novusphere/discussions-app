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
    if (isDev) return 'discussions.app'
    return window.location.hostname
}

export const getOrigin = () => {
    if (isDev) return 'https://discussions.app'
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
        url += `#${permalinkUuid}`
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

export const transformTipsToTransfers = ({
    tips,
    replyingToUIDW,
    replyingToDisplayName,
    replyingToPostPub,
    privateKey,
    tokens,
}) => {
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
        if (items) {
            return items.match(regex)[0]
        }
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
