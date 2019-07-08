import { Post, PostMetaData } from '../post';
import Thread from "../thread";
import { eos, nsdb } from "../../index";

export default class DiscussionsService {
    cursorId: number;

    constructor() {
        this.cursorId = 0;
    }

    async makePost(p: Post): Promise<string> {
        if (p.chain != 'eos') throw new Error('Unknown chain');

        const tags = new Set();
        [ p.sub, ...p.tags ].forEach( t => tags.add(t.toLowerCase()));

        const mentions = new Set();
        p.mentions.forEach(u => mentions.add(u));

        const metadata : PostMetaData = {};
        if (p.title) metadata.title = p.title;
        if (p.attachment.value)  metadata.attachment = p.attachment;
        if (p.pub && p.sig) {
            metadata.pub = p.pub;
            metadata.sig = p.sig;
        }

        return await eos.transact({
            contract: "discussionsx",
            name: "post",
            data: {
                poster: p.poster,
                content: p.content,
                uuid: p.uuid,
                threadUuid: p.threadUuid,
                parentUuid: p.parentUuid,
                tags: Array.from(tags),
                mentions: Array.from(mentions),
                metadata: JSON.stringify(metadata)
            }
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

    async getPostsForSubs(_subs: string[]): Promise<Post[]> {
        const query = await nsdb.search(0, {
            "sub": { "$in": _subs }
        }, {
            "createdAt": -1
        });

        this.cursorId = query.cursorId;
        return query.payload.map(o => Post.fromDbObject(o));
    }

    async getPostsForTags(_tags: string[]): Promise<Post[]> {
        const query = await nsdb.search(0, {
            "tags": { "$in": [ 'test' ] }
        }, {
            "createdAt": -1
        });

        this.cursorId = query.cursorId;
        let posts = query.payload.map(o => Post.fromDbObject(o));
        console.log(posts);
        return posts;
    }
};
