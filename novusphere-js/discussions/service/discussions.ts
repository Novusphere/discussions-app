import { Post, PostMetaData } from '../post'
import Thread from '../thread'
import { eos, nsdb } from '../../index'
const aesjs = require('aes-js')
//const crypto = require('crypto');
const bip39 = require('bip39')
import * as bip32 from 'bip32'
import ecc from 'eosjs-ecc'
import axios from 'axios'
import { INSDBSearchQuery } from '../../nsdb'
import { encodeId, getHostName, getSettings, getThreadTitle, getThreadUrl, isDev } from '@utils'
//import { isDev } from '@utils'
import moment from 'moment'

export interface IBrainKeyPair {
    priv: string
    pub: string
}

export default class DiscussionsService {
    constructor() {}

    bkCreate(): string {
        return bip39.generateMnemonic()
    }

    bkIsValid(bk: string): boolean {
        return bip39.validateMnemonic(bk)
    }

    /*private bkGetBitcoin(node: bip32.BIP32Interface) {

        function hash160(data: Buffer) {
            var hash = crypto.createHash('ripemd160');
            let res = hash.update(data);
            return res.digest();
        }

        return;
    }*/

    public checkIfPostIsValid(i: any) {
        const hash0 = ecc.sha256(i.content)
        const hash1 = ecc.sha256(i.uuid + hash0)
        const rpk = ecc.recover(i.metadata.sig, hash1)
        const check = rpk == i.metadata.pub
        return check
    }

    private aesEncrypt(data: string, password: string): string {
        var key = aesjs.utils.hex.toBytes(ecc.sha256(password))
        var textBytes = aesjs.utils.utf8.toBytes(data)
        var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5))
        var encryptedBytes = aesCtr.encrypt(textBytes)
        var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes)
        return encryptedHex
    }

    private aesDecrypt(data: string, password: string): string {
        var key = aesjs.utils.hex.toBytes(ecc.sha256(password))
        var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5))
        var encryptedBytes = aesjs.utils.hex.toBytes(data)
        var decryptedBytes = aesCtr.decrypt(encryptedBytes)
        var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes)
        return decryptedText
    }

    bkFromStatusJson(statusJson: string, password: string): string {
        console.log('bkFromStatusJSON un-parsed:', statusJson)
        let status

        if (statusJson === 'test') {
            status = statusJson
        } else {
            status = JSON.parse(statusJson)
        }

        console.log('bkFromStatusJSON parsed:', status)
        let bkc = status['bkc']
        let bk = status['bk']
        if (!bkc || !bk) throw new Error('No brian key found')
        let test = this.aesDecrypt(bkc, password)
        if (test != 'test') throw new Error('Incorrect brian key pasword')
        return this.aesDecrypt(bk, password)
    }

    async bkToStatusJson(
        bk: string,
        displayName: string,
        password: string,
        status: any
    ): Promise<string> {
        if (!status) status = {}
        const keys = await this.bkToKeys(bk)
        for (var k in keys) {
            status[k] = keys[k].pub
        }
        status['displayName'] = displayName
        status['bk'] = this.aesEncrypt(bk, password)
        status['bkc'] = this.aesEncrypt('test', password)
        return JSON.stringify(status)
    }

    async encryptedBKToKeys(bk: string, bkc: string, password: string): Promise<any> {
        try {
            // check if password is right
            const comparison = this.aesDecrypt(bkc, password)

            if (comparison !== 'test') {
                throw new Error('The password you have entered is invalid.')
            }

            const unencryptedBk = this.aesDecrypt(bk, password)
            const keys = await this.bkToKeys(unencryptedBk)
            return keys.uidwallet.priv
        } catch (error) {
            throw error
        }
    }

    private bkGetEOS(node: bip32.BIP32Interface, n: number): IBrainKeyPair {
        let child = node.derivePath(`m/80'/0'/0'/${n}`)
        const wif = child.toWIF()
        return {
            priv: wif,
            pub: ecc.privateToPublic(wif),
        }
    }

    async bkToKeys(
        bk: string
    ): Promise<{
        post: { priv: string; pub: string }
        uidwallet: { priv: string; pub: string }
        account: { priv: string; pub: string }
    }> {
        const seed = await bip39.mnemonicToSeed(bk)
        const node = await bip32.fromSeed(seed)

        const keys = {
            post: null,
            uidwallet: null,
            account: null,
        }

        //keys['BTC'] = this.bkGetBitcoin(node);
        keys['post'] = this.bkGetEOS(node, 0)
        keys['uidwallet'] = this.bkGetEOS(node, 1)
        keys['account'] = this.bkGetEOS(node, 2)
        return keys
    }

    async getPostsForSearch(
        search: string,
        searchCursorId = undefined,
        count = 0,
        key = '',
        sort = 'popular'
    ): Promise<{
        results: Post[]
        cursorId: number
    }> {
        const { payload, cursorId } = await nsdb.search({
            op: true,
            sort,
            key,
            cursorId: searchCursorId,
            count,
            pipeline: [
                {
                    $match: {
                        $text: { $search: search },
                    },
                },
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
            ],
        })

        const results = payload.map(o => Post.fromDbObject(o))

        return {
            results,
            cursorId,
        }
    }

    async bkRetrieveStatusEOS(account: string): Promise<string | undefined> {
        let result = await eos.api.rpc.get_table_rows({
            code: 'discussionsx',
            scope: 'discussionsx',
            table: 'status',
            lower_bound: account,
            upper_bound: account,
        })

        if (result.rows.length == 0) return undefined
        return result.rows[0].content
    }

    async bkUpdateStatusEOS(statusJson: string): Promise<string> {
        try {
            if (eos.auth && eos.auth.accountName) {
                return await eos.transact({
                    account: 'discussionsx',
                    name: 'status',
                    data: {
                        account: eos.auth.accountName,
                        content: statusJson,
                    },
                })
            }
        } catch (error) {
            throw error
        }
    }

    async vote(uuid: string, value: number): Promise<string> {
        try {
            if (eos.auth && eos.auth.accountName) {
                return await eos.transact({
                    account: 'discussionsx',
                    name: 'vote',
                    data: {
                        voter: eos.auth.accountName,
                        uuid: uuid,
                        value: value,
                    },
                })
            }
        } catch (error) {
            throw error
        }
    }

    async post(p: Post): Promise<any> {
        if (p.chain != 'eos') throw new Error('Unknown chain')

        const tags = new Set()
        ;[p.sub, ...p.tags].forEach(t => tags.add(t.toLowerCase()))

        const mentions = new Set<string>()
        p.mentions.forEach(u => mentions.add(u))

        const metadata: PostMetaData = {}
        if (p.title) metadata.title = p.title
        if (p.attachment.value) metadata.attachment = p.attachment

        if (p.pub && p.sig) {
            metadata.pub = p.pub
            metadata.sig = p.sig
        }

        metadata.displayName = p.displayName || p.poster
        metadata.mentions = Array.from(mentions)

        if (p.edit) {
            metadata.edit = true
        }

        if (p.uidw) {
            metadata.uidw = p.uidw
        }

        let post: any = {
            poster: p.poster,
            content: p.content,
            uuid: p.uuid,
            vote: p.vote,
            threadUuid: p.threadUuid,
            parentUuid: p.parentUuid,
            tags: Array.from(tags),
            mentions: [],
            metadata: JSON.stringify(metadata),
            transaction: '',
        }

        if (p.transfers && p.transfers.length > 0) {
            post.transfers = p.transfers
            post.notify = JSON.stringify({ name: 'tip', data: { parentUuid: p.parentUuid } })
        }

        try {
            if (!p.poster) {
                console.log('no poster found, posting as anon!')
                const { data } = await axios.post(
                    `${nsdb.api}/discussions/post`,
                    `data=${encodeURIComponent(JSON.stringify(post))}`
                )

                if (data.error) {
                    console.error('Post that failed: ', post)
                    if (data.hasOwnProperty('message')) {
                        throw new Error(`Failed to post: ${data.message}`)
                    }
                    throw new Error(`Failed to post: ${JSON.stringify(data)}`)
                }
                p.transaction = data.transaction
            } else {
                console.log('poster found, opening Scatter to confirm')
                const transaction = await eos.transact([
                    {
                        account: 'discussionsx',
                        name: 'post',
                        data: post,
                    },
                    {
                        account: 'discussionsx', // self up vote
                        name: 'vote',
                        data: {
                            voter: p.poster,
                            uuid: p.uuid,
                            value: 1,
                        },
                    },
                ])

                p.transaction = transaction
            }

            console.log('transaction set: !', p.transaction)
            return {
                ...p,
                metadata,
            }
        } catch (error) {
            throw error
        }
    }

    async getThreadReplyCount(_id: string): Promise<number> {
        let dId = Post.decodeId(_id)
        const isServer = false // ?
        const searchQuery = {
            pipeline: [
                {
                    $match: {
                        createdAt: {
                            $gte: dId.timeGte, // + (!isDev && isServer ? 18000000 : 0),
                            $lte: dId.timeLte, // + (!isDev && isServer ? 18000000 : 0),
                        },
                        transaction: { $regex: `^${dId.txid32}` },
                    },
                },
            ],
        }

        let sq = await nsdb.search(searchQuery)

        if (sq.payload.length == 0) return 0

        let op = Post.fromDbObject(sq.payload[0])

        return op.totalReplies
    }

    async getUser(
        pub: string
    ): Promise<{
        followers: number
        pub: string
        posts: number
        threads: number
        uidw: string
        displayName: string
    }> {
        try {
            const { data } = await axios.get(`${nsdb.api}/discussions/site/profile/${pub}`)
            return data
        } catch (error) {
            return { followers: 0, pub: '', posts: 0, threads: 0, uidw: '', displayName: '' }
        }
    }

    private convertEncodedThreadIdIntoQuery = (_id: string, key = '') => {
        let dId = Post.decodeId(_id)

        if (!dId) throw new Error('Unable to decode id')

        const searchQuery = {
            key: key,
            pipeline: [
                {
                    $match: {
                        createdAt: {
                            $gte: dId.timeGte, // + (!isDev && isServer ? 18000000 : 0),
                            $lte: dId.timeLte, // + (!isDev && isServer ? 18000000 : 0),
                        },
                        transaction: { $regex: `^${dId.txid32}` },
                    },
                },
            ],
        }

        return searchQuery
    }

    async getThread(
        _id: string,
        key = '',
        hostname = getHostName(),
        lastQueryTime: number | Date = 0
    ): Promise<Thread | null> {
        try {
            const searchQuery = this.convertEncodedThreadIdIntoQuery(_id, key)

            let sq = await nsdb.search(searchQuery)

            if (sq.payload.length == 0) return null

            let posts: Post[] = []
            let op: any = Post.fromDbObject(sq.payload[0])

            sq = {
                key: key,
                pipeline: [
                    {
                        // $match: {
                        //     threadUuid: op.threadUuid,
                        //     sub: op.sub,
                        // },
                        $match: {
                            $or: [
                                {
                                    threadUuid: op.threadUuid,
                                    sub: op.sub,
                                    createdAt: {
                                        $gt:
                                            lastQueryTime instanceof Date
                                                ? moment(lastQueryTime).unix()
                                                : lastQueryTime,
                                    },
                                },
                                {
                                    uuid: op.threadUuid,
                                    threadUuid: op.threadUuid,
                                    sub: op.sub,
                                },
                            ],
                        },
                    },
                ],
            }

            do {
                sq = await nsdb.search(sq)
                posts = [...posts, ...sq.payload.map(o => Post.fromDbObject(o))]
            } while (sq.cursorId)

            let thread = new Thread()

            thread.init(posts)
            thread.normalize()

            let settings = await getSettings(hostname)

            if (
                typeof thread !== 'undefined' &&
                typeof thread.openingPost !== 'undefined' &&
                typeof settings['tags'][thread.openingPost.sub] !== 'undefined'
            ) {
                thread.icon = settings['tags'][thread.openingPost.sub]['icon']
            }

            return thread
        } catch (error) {
            console.error('getThreadAsync error', error)
            throw error
        }
    }

    /**
     * Returns a post object given a URL
     * @param url - i.e. /tag/blockchainnormies/2m9sh509np65m/blockchain_for_normies_beta_newsletter
     * @param key - the active public key
     * @returns Post
     */
    async getPostsByAsPathURL(url: string, key = ''): Promise<Post> {
        try {
            const [, , , id] = url.split('/')
            const searchQuery = this.convertEncodedThreadIdIntoQuery(id, key)
            let sq = await nsdb.search(searchQuery)
            if (sq.payload.length == 0) return null
            return Post.fromDbObject(sq.payload[0])
        } catch (error) {
            throw error
        }
    }

    async getPostsForSubs(
        subs: string[],
        cursorId = undefined,
        count = 0,
        limit = 20,
        key = '',
        sort = 'popular'
    ): Promise<{
        posts: Post[]
        cursorId: number
    }> {
        let q: any = { $in: subs.map(sub => sub.toLowerCase()) }
        if (subs.length == 1 && subs[0] == 'all') {
            q = { $nin: [] } // filtered subs from all sub
        }

        const query = await nsdb.search({
            sort,
            key,
            cursorId,
            count,
            limit,
            pipeline: [
                {
                    $match: {
                        tags: q,
                        parentUuid: '', // top-level only
                    },
                },
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
            ],
        })

        let posts = query.payload.map(o => Post.fromDbObject(o))

        return {
            posts,
            cursorId: query.cursorId,
        }
    }

    async getPostsForKeys(
        keys: string[],
        cursorId = undefined,
        count = 0,
        limit = 20,
        key = '',
        sort = 'popular'
    ): Promise<{
        posts: Post[]
        cursorId: number
    }> {
        const query = await nsdb.search({
            op: true,
            sort,
            key,
            cursorId,
            count,
            limit,
            pipeline: [
                {
                    $match: {
                        pub: { $in: keys },
                    },
                },
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
            ],
        })

        let posts = query.payload.map(o => Post.fromDbObject(o))

        return {
            posts,
            cursorId: query.cursorId,
        }
    }

    async getPostsForTags(
        tags: string[],
        cursorId = undefined,
        count = 0,
        limit = 5,
        key = '',
        threadOnly = true
    ): Promise<{
        posts: Post[]
        cursorId: number
    }> {
        let searchQuery = { tags: { $in: tags.map(tag => tag.toLowerCase()) } }

        if (threadOnly) {
            searchQuery['parentUuid'] = ''
        }

        try {
            const query = await nsdb.search({
                key,
                cursorId,
                count,
                limit,
                pipeline: [{ $match: searchQuery }, { $sort: { createdAt: -1 } }],
            })

            let posts = query.payload.map(o => Post.fromDbObject(o))

            return {
                posts,
                cursorId: query.cursorId,
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * Returns all the posts in which the user was
     * tagged in (mentions).
     */
    async getPostsForNotifications(
        postPublicKey: string,
        lastCheckedNotifications: number,
        cursorId = undefined,
        count = 0,
        limit = 20,
        watchedIds = [],
        viewAll = false
    ): Promise<INSDBSearchQuery> {
        try {
            const sq = {
                op: true,
                pipeline: [
                    {
                        $match: {
                            $or: [
                                {
                                    createdAt: { $gte: lastCheckedNotifications },
                                    mentions: { $in: [postPublicKey] },
                                },
                                ...watchedIds
                                    .filter(([, post]) => post.threadUuid)
                                    .map(([, post]) => ({
                                        threadUuid: post.threadUuid,
                                        createdAt: {
                                            $gte: viewAll
                                                ? post.watchedAt
                                                : lastCheckedNotifications,
                                        },
                                    })),
                            ],
                        },
                    },
                    { $sort: { createdAt: -1 } },
                ],
                cursorId,
                count,
                limit,
            }

            const response = await nsdb.search(sq)
            return {
                ...response,
                payload: response.payload.map(p => Post.fromDbObject(p)),
            }
        } catch (error) {
            throw error
        }
    }

    async getPostsByTransaction(transaction: string) {
        try {
            return await nsdb.search({
                pipeline: [
                    {
                        $match: {
                            transaction,
                        },
                    },
                ],
            })
        } catch (error) {
            throw error
        }
    }

    async wasEditSubmitted(txId: string, editUuid: string) {
        try {
            const query = await nsdb.search({
                limit: 1,
                pipeline: [
                    {
                        $match: {
                            transaction: txId,
                            edit: editUuid,
                        },
                    },
                ],
            })

            return query.payload.length > 0
        } catch (error) {
            throw error
        }
    }
}
