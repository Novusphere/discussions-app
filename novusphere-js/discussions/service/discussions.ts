import { Post, PostMetaData } from '../post';
import Thread from "../thread";
import { eos, nsdb } from "../../index";

export default class DiscussionsService {

    constructor() {
    }

    async vote(uuid: string, value: number): Promise<string> {
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
        let sq;

        // if (isNaN(parseInt(_id))) {
        let dId = Post.decodeId(_id);
        sq = await nsdb.search({
            query: {
                createdAt: { $gte: dId.timeGte, $lte: dId.timeLte },
                transaction: { $regex: `^${dId.txid32}` }
            }
        })
        // }
        // else {
        //     sq = await nsdb.search({ query: { id: parseInt(_id) } });
        // }

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
        const query = await nsdb.search({
            query: {
                "sub": { "$in": subs }
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
