import { Post } from './post'
import { REDDIT_URL } from './attachment'
import { RedditService } from './service/reddit'

export default class Thread {
    openingPost: Post | undefined
    map: { [uuid: string]: Post }

    get title(): string | undefined {
        return this.openingPost ? this.openingPost.title : undefined
    }

    get uuid(): string | undefined {
        return this.openingPost ? this.openingPost.uuid : undefined
    }

    get totalReplies(): number {
        return this.openingPost ? this.openingPost.totalReplies : 0
    }

    init(posts: Post[]) {
        this.map = {}

        if (posts.length == 0) return new Error('Cannot create thread with zero posts')
        const threadUuid = posts[0].threadUuid

        this.openingPost = posts.find(p => p.uuid == threadUuid)
        if (!this.openingPost) return new Error('No opening post found!')

        for (let i = 0; i < posts.length; i++) {
            const p = posts[i]
            if (p.uuid in this.map) continue

            //if (!p.edit) {
            if (this.map[p.uuid] == undefined) {
                this.map[p.uuid] = p
            }
            //} else if (p.parentUuid) {
            //    const parent = this.map[p.parentUuid]
            //    if (parent) {
            //        parent.applyEdit(p)
            //    }
            //}
        }
    }

    async importRedditReplies() {
        if (!this.openingPost) return
        if (!this.openingPost.attachment.value) return
        if (!this.openingPost.attachment.value.match(REDDIT_URL)) return

        let url = this.openingPost.attachment.value.split('/')
        var r = url.findIndex(p => p == 'r')

        if (r > -1) {
            let rs = new RedditService()
            let redditPosts = await rs.getThread(this.openingPost, url[r + 1], url[r + 3])
            if (redditPosts.length > 0) {
                for (let i = 1; i < redditPosts.length; i++)
                    this.map[redditPosts[i].uuid] = redditPosts[i]
                this.openingPost.uuid = redditPosts[0].uuid
            }
        }
    }

    async normalize() {
        if (!this.openingPost) return

        await this.importRedditReplies()

        let posts: Post[] = []

        // build the thread
        for (var uuid in this.map) {
            const post: Post = this.map[uuid]
            if (post.parentUuid) {
                const parent: Post = this.map[post.parentUuid]
                if (parent) {
                    post.depth = parent.depth + 1;
                    parent.replies.push(post)
                }
            }
            posts.push(post)
        }

        // wait for normalization
        await Promise.all(posts.map(p => p.normalize()))
    }
}
