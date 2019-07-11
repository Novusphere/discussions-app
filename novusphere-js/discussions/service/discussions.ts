import { Post, PostMetaData } from '../post';
import Thread from "../thread";
import { eos, nsdb } from "../../index";

export default class DiscussionsService {
    cursorId: number;

    constructor() {
        this.cursorId = 0;
    }

    async vote(uuid: string, value: number): Promise<string> {
        return await eos.transact({
            contract: "discussionsx",
            name: "vote",
            data: {
                voter: eos.auth.accountName,
                uuid: uuid,
                value: value
            }
        });
    }

    async post(p: Post): Promise<string> {
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
            metadata: JSON.stringify(metadata)
        };

        //console.log(data);

        return await eos.transact({
            account: "discussionsx",
            name: "post",
            data: data
        });
    }

    async getThread(_chain: string, _id: number): Promise<Thread | undefined> {
        let query = await nsdb.search(0, { id: _id }, null);
        if (query.payload.length == 0) return undefined;

        let op = Post.fromDbObject(query.payload[0]);
        query = await nsdb.search(0, { threadUuid: op.threadUuid, sub: op.sub }, null);

        this.cursorId = query.cursorId;

        let posts = query.payload.map(o => Post.fromDbObject(o));
        let thread = new Thread();
        thread.init(posts);
        return thread;
    }

    async getPostsForSubs(subs: string[]): Promise<Post[]> {
        const query = await nsdb.search(0, {
            "sub": { "$in": subs }
        }, {
                "createdAt": -1
            });

        this.cursorId = query.cursorId;
        return query.payload.map(o => Post.fromDbObject(o));
    }

    async getPostsForTags(tags: string[]): Promise<Post[]> {
        const query = await nsdb.search(0, {
            "tags": { "$in": tags }
        }, {
                "createdAt": -1
            });

        this.cursorId = query.cursorId;
        let posts = query.payload.map(o => Post.fromDbObject(o));
        // console.log(tags, posts);
        return posts;
    }
};
