import { Post, PostMetaData } from '../post'
import Thread from '../thread'
import { eos, nsdb } from '@novuspherejs'
const aesjs = require('aes-js')
//const crypto = require('crypto');
const bip39 = require('bip39')
import * as bip32 from 'bip32'
import ecc from 'eosjs-ecc'

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
    ): Promise<{ post: { priv: string; pub: string }; tip: { priv: string; pub: string } }> {
        const seed = await bip39.mnemonicToSeed(bk)
        const node = await bip32.fromSeed(seed)

        const keys = {
            post: null,
            tip: null,
        }

        //keys['BTC'] = this.bkGetBitcoin(node);
        keys['post'] = this.bkGetEOS(node, 0)
        keys['tip'] = this.bkGetEOS(node, 1)
        return keys
    }

    async getPostsForSearch(search: string): Promise<Post[]> {
        const query = await nsdb.search({
            query: {
                $text: { $search: search },
            },
            sort: {
                createdAt: -1,
            },
            account: eos.accountName || '',
        })

        return query.payload.map(o => Post.fromDbObject(o))
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

    async post(p: Post): Promise<Post> {
        console.log('poster name: ', p.poster)
        console.log('display name: ', p.displayName)

        if (p.chain != 'eos') throw new Error('Unknown chain')

        const tags = new Set()
        ;[p.sub, ...p.tags].forEach(t => tags.add(t.toLowerCase()))

        const mentions = new Set()
        p.mentions.forEach(u => mentions.add(u))

        const metadata: PostMetaData = {}
        if (p.title) metadata.title = p.title
        if (p.attachment.value) metadata.attachment = p.attachment
        if (p.pub && p.sig) {
            metadata.pub = p.pub
            metadata.sig = p.sig
        }
        metadata.displayName = p.displayName || p.poster

        const data = {
            poster: p.poster,
            content: p.content,
            uuid: p.uuid,
            threadUuid: p.threadUuid,
            parentUuid: p.parentUuid,
            tags: Array.from(tags),
            mentions: Array.from(mentions),
            metadata: JSON.stringify(metadata),
            transaction: '',
        }

        try {
            if (!p.poster) {
                console.log('no poster found, posting as anon')
                const resp = await fetch(
                    `${nsdb.api}/discussions/post?data=${JSON.stringify(data)}`
                )
                const res = await resp.json()
                if (res.error) throw new Error(res.message)
                p.transaction = res.transaction
            } else {
                console.log('poster found, opening Scatter to confirm')
                const transaction = await eos.transact([
                    {
                        account: 'discussionsx',
                        name: 'post',
                        data: data,
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
            p.myVote = 1
            return p
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    async getThread(_id: string): Promise<Thread | undefined> {
        let dId = Post.decodeId(_id)
        let sq = await nsdb.search({
            query: {
                createdAt: { $gte: dId.timeGte, $lte: dId.timeLte },
                transaction: { $regex: `^${dId.txid32}` },
            },
        })

        if (sq.payload.length == 0) return undefined

        let posts: Post[] = []
        let op = Post.fromDbObject(sq.payload[0])

        sq = {
            query: {
                threadUuid: op.threadUuid,
                sub: op.sub,
            },
            account: eos.accountName || '',
        }

        do {
            sq = await nsdb.search(sq)
            posts = [...posts, ...sq.payload.map(o => Post.fromDbObject(o))]
        } while (sq.cursorId)

        let thread = new Thread()
        thread.init(posts)
        thread.normalize()
        return thread
    }

    async getPostsForSubs(subs: string[]): Promise<Post[]> {
        let q: any = { $in: subs.map(sub => sub.toLowerCase()) }
        if (subs.length == 1 && subs[0] == 'all') {
            q = { $nin: [] } // filtered subs from all sub
        }

        const query = await nsdb.search({
            query: {
                sub: q,
                parentUuid: '', // top-level only
            },
            sort: {
                createdAt: -1,
            },
            account: eos.accountName || '',
        })

        return query.payload.map(o => Post.fromDbObject(o))
    }

    async getPostsForTags(tags: string[]): Promise<Post[]> {
        const query = await nsdb.search({
            query: {
                tags: { $in: tags.map(tag => tag.toLowerCase()) },
            },
            sort: {
                createdAt: -1,
            },
            account: eos.accountName || '',
        })

        let posts = query.payload.map(o => Post.fromDbObject(o))
        return posts
    }
};
