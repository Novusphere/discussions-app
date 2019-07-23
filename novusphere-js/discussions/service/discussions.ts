import { Post, PostMetaData } from '../post';
import Thread from "../thread";
import { eos, nsdb } from "@novuspherejs";
const bip39 = require('bip39');
import * as bip32 from 'bip32';
import ecc from 'eosjs-ecc';

export interface IBrianKeyPair {
    priv: string;
    pub: string;
}

export default class DiscussionsService {

    constructor() {
    }

    bkCreate(): string {
        return bip39.generateMnemonic();
    }

    bkIsValid(bk: string): boolean {
        return bip39.validateMnemonic(bk);
    }

    /*private bkGetBitcoin(node: bip32.BIP32Interface) {
        let child = node.derivePath("m/44'/0'/0'/0");
        return {
            priv: child.privateKey.toString('hex'),
            pub: child.publicKey.toString('hex'),
            address: child.toBase58()
        }
    }*/

    private bkGetEOS(node: bip32.BIP32Interface, n: number) : IBrianKeyPair {
        let child = node.derivePath(`m/80'/0'/0'/${n}`);
        const wif = child.toWIF();
        return {
            priv: wif,
            pub: ecc.privateToPublic(wif)
        };
    }

    async bkToKeys(bk: string) {
        const seed = await bip39.mnemonicToSeed(bk);
        const node = await bip32.fromSeed(seed);
        
        const keys = {};
        //keys['BTC'] = this.bkGetBitcoin(node);
        keys['post'] = this.bkGetEOS(node, 0);
        keys['tip'] = this.bkGetEOS(node, 1);
        return keys;
    }

    async vote(uuid: string, value: number): Promise<string> {
        try {
            if (eos.auth && eos.auth.accountName) {
                return await eos.transact({
                    account: "discussionsx",
                    name: "vote",
                    data: {
                        voter: eos.auth.accountName,
                        uuid: uuid,
                        value: value
                    }
                });
            }
        } catch (error) {
            throw error
        }
    }

    async post(p: Post): Promise<Post> {
        if (p.chain != 'eos') throw new Error('Unknown chain');

        const tags = new Set();
        [p.sub, ...p.tags].forEach(t => tags.add(t.toLowerCase()));

        const mentions = new Set();
        p.mentions.forEach(u => mentions.add(u));

        const metadata: PostMetaData = {};
        if (p.title) metadata.title = p.title;
        if (p.attachment.value) metadata.attachment = p.attachment;
        if (p.pub && p.sig) {
            metadata.pub = p.pub;
            metadata.sig = p.sig;
        }

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
        };

        try {
            const transaction = await eos.transact([{
                account: "discussionsx",
                name: "post",
                data: data
            },
            {
                account: "discussionsx", // self up vote
                name: "vote",
                data: {
                    voter: p.poster,
                    uuid: p.uuid,
                    value: 1
                }
            }
            ]);

            p.transaction = transaction
            p.myVote = 1
            return p
        } catch (error) {
            throw error
        }
    }

    async getThread(_id: string): Promise<Thread | undefined> {
        let dId = Post.decodeId(_id);
        let sq = await nsdb.search({
            query: {
                createdAt: { $gte: dId.timeGte, $lte: dId.timeLte },
                transaction: { $regex: `^${dId.txid32}` }
            }
        })

        if (sq.payload.length == 0) return undefined;

        let posts: Post[] = [];
        let op = Post.fromDbObject(sq.payload[0]);

        sq = {
            query:
            {
                threadUuid: op.threadUuid,
                sub: op.sub
            },
            account: eos.accountName || ''
        };

        do {
            sq = await nsdb.search(sq);
            posts = [...posts, ...sq.payload.map(o => Post.fromDbObject(o))];
        }
        while (sq.cursorId);

        let thread = new Thread();
        thread.init(posts);
        thread.normalize();
        return thread;
    }

    async getPostsForSubs(subs: string[]): Promise<Post[]> {

        let q: any = { "$in": subs };
        if (subs.length == 1 && subs[0] == 'all') {
            q = { "$nin": [] }; // filtered subs from all sub
        }

        const query = await nsdb.search({
            query: {
                "sub": q,
                "parentUuid": "" // top-level only
            },
            sort: {
                "createdAt": -1
            },
            account: eos.accountName || ''
        });

        return query.payload.map(o => Post.fromDbObject(o));
    }

    async getPostsForTags(tags: string[]): Promise<Post[]> {
        const query = await nsdb.search({
            query: {
                "tags": { "$in": tags }
            }, sort: {
                "createdAt": -1
            },
            account: eos.accountName || ''
        });

        let posts = query.payload.map(o => Post.fromDbObject(o));
        return posts;
    }
};
