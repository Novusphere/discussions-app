import Post from './post';

export default class Thread {
    openingPost: Post | undefined;
    map: { [uuid: string]: Post };

    get title(): string | undefined {
        return this.openingPost ? this.openingPost.title : undefined;
    }

    get uuid(): string | undefined {
        return this.openingPost ? this.openingPost.uuid : undefined;
    }
    
    get totalReplies() : number {
        return this.openingPost ? this.openingPost.totalReplies : 0;
    }

    constructor(posts: Post[]) {
        this.map = {};

        if (posts.length == 0) throw new Error('Cannot create thread with zero posts');
        const threadUuid = posts[0].threadUuid;

        this.openingPost = posts.find(p => p.uuid == threadUuid);
        if (!this.openingPost) throw new Error('No opening post found!');

        for (let i = 0; i < posts.length; i++) {
            const p = posts[i];
            if (p.uuid in this.map) continue;
            this.map[p.uuid] = p;

            // normally, this will be empty, but might be set via Reddit
            p.replies.forEach(pr => this.map[pr.uuid] = pr);

            if (p.parentUuid) {
                const parent = this.map[p.parentUuid];
                if (parent) {
                    if (p.edit)
                        parent.applyEdit(p);
                    else
                        parent.replies.push(p);
                }
            }
        }
    }

    async normalize() {
        if (!this.openingPost) return;

        let promises: Promise<any>[] = [];
        let stack = [ this.openingPost ];
        while (stack.length > 0) {
            //@ts-ignore
            let p : Post = stack.pop();
            promises.push(p.normalize());
            for (let i : number = 0; i < p.replies.length; i++)
                stack.push(p.replies[i]);
        }

        await Promise.all(promises);
    }
}
