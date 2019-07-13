// https://www.reddit.com/prefs/apps
// https://github.com/JubbeArt/removeddit/blob/master/src/api/reddit/auth.js

// https://api.pushshift.io/reddit/search/comment?sort=asc&link_id=....&limit=10000
// https://api.pushshift.io/reddit/search/submission?ids=....

const fetch = require('node-fetch');
import { Post } from "../post";
//import { AttachmentType, AttachmentDisplay, Attachment } from "../attachment";

let clientId: string = 'Gu4d7t1AglWJVg';
let token: string | undefined = undefined;

const toBase36 = number => parseInt(number, 10).toString(36);
const toBase10 = numberString => parseInt(numberString, 36);

// Reddits way of indicating that something is deleted (the '\\' is for Reddit and the other is for pushshift)
export const isDeleted = textBody => textBody === '\\[deleted\\]' || textBody === '[deleted]'

// Reddits way of indicating that something is deleted
export const isRemoved = textBody => textBody === '\\[removed\\]' || textBody === '[removed]'

export class RedditService {
    redditDataToPost(data: any): Post {
        let p = new Post('reddit');
        p.id = toBase10(data.id);
        p.transaction = data.id;
        p.uuid = 'reddit-' + data.id;
        if (data.parent_id) {
            p.parentUuid = 'reddit-' + data.parent_id.substring(3);
        }
        p.poster = data.author;
        p.title = data.title;
        p.content = data.selftext || data.body;
        p.createdAt = new Date(data.created_utc * 1000);
        p.upvotes = data.ups;
        return p;
    }

    async getThread(owner: Post, subreddit: string, threadId: string): Promise<Post[]> {
        console.log(subreddit + ' ' + threadId);

        let posts: Post[] = [];
        let auth = await this.getAuth();
        let response = await fetch(`https://oauth.reddit.com/r/${subreddit}/comments/${threadId}/_/`, auth);
        let json = await response.json();

        posts.push(this.redditDataToPost(json[0].data.children[0].data));
        
        const replies = [ json[1].data.children ];
        while (replies.length > 0) {
            const children = replies.shift();
            for (let i = 0; i < children.length; i++) {
                const child = children[i].data;
                posts.push(this.redditDataToPost(child));
                if (child.replies) {
                    replies.unshift(child.replies.data.children);
                }
            }
        }

        for (let i = 0; i < posts.length; i++) {
            posts[i].sub = owner.sub;
            posts[i].threadUuid = owner.threadUuid;
        }

        return posts;
    }

    async getThreadPushShift(subreddit: string, threadId: string) {
        let post = await this.getPost(subreddit, threadId);
        if (isDeleted(post.selftext) || isRemoved(post.selftext)) {
            let removedPost = await this.getPostPushShift(threadId);
            if (isRemoved(post.selftext)) {
                removedPost.removed = true;
            } else {
                removedPost.deleted = true;
            }
        }

        // Get comment ids from pushshift
        let pushshiftComments = await this.getCommentsPushShift(threadId);

        // Extract ids from pushshift response
        const ids = pushshiftComments.map(comment => comment.id);

        // Get all the comments from reddit
        let redditComments: any[] = await this.getComments(ids);

        // Temporary lookup for updating score
        const redditCommentLookup = {}
        redditComments.forEach(comment => {
            redditCommentLookup[comment.id] = comment;
        })

        // Replace pushshift score with reddit (its usually more accurate)
        pushshiftComments.forEach(comment => {
            const redditComment = redditCommentLookup[comment.id];
            if (redditComment !== undefined) {
                comment.score = redditComment.score;
            }
        })

        const removed: string[] = [];
        const deleted: string[] = [];

        // Check what as removed / deleted according to reddit
        redditComments.forEach(comment => {
            if (isRemoved(comment.body)) {
                removed.push(comment.id);
            } else if (isDeleted(comment.body)) {
                deleted.push(comment.id);
            }
        })

        return {
            comments: pushshiftComments,
            removed: removed,
            deleted: deleted
        }
    }

    async getAuth() {
        let token = await this.getToken();
        return {
            headers: {
                Authorization: `bearer ${token}`
            }
        };
    }

    async getToken(): Promise<string> {
        if (token) {
            return token;
        }

        // Headers for getting reddit api token
        const tokenInit = {
            headers: {
                Authorization: `Basic ${window.btoa(`${clientId}:`)}`,
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            method: 'POST',
            body: `grant_type=${encodeURIComponent('https://oauth.reddit.com/grants/installed_client')}&device_id=DO_NOT_TRACK_THIS_DEVICE`
        }

        let response = await fetch('https://www.reddit.com/api/v1/access_token', tokenInit);
        let json = await response.json();
        token = json.access_token;
        return token || '';
    }

    async getPost(subreddit: string, threadId: string) {
        let auth = await this.getAuth();
        let response = await fetch(`https://oauth.reddit.com/r/${subreddit}/comments/${threadId}/_/`, auth);
        let json = await response.json();
        let post = json[0].data.children[0].data;
        return json;
    }

    async getPostPushShift(threadId: string) {
        const elasticQuery = {
            query: {
                term: {
                    id: toBase10(threadId)
                }
            }
        }

        let response = await fetch('https://elastic.pushshift.io/rs/submissions/_search?source=' + JSON.stringify(elasticQuery));
        let json = await response.json();
        let post = json.hits.hits[0]._source;
        post.id = toBase36(post.id)
        return post;
    }

    async getComments(commentIds: string[]) {
        let auth = await this.getAuth();
        let promises: Promise<any>[] = [];
        for (let i = 0; i < commentIds.length; i += 100) {
            let ids = commentIds.slice(i, i + 100);
            promises.push(new Promise(async (resolve) => {
                let response = await fetch(`https://oauth.reddit.com/api/info?id=${ids.map(id => `t1_${id}`).join()}`, auth);
                let json = await response.json();
                let commentsData = json.data.children;
                return resolve(commentsData.map(commentData => commentData.data));
            }));
        }

        return (await Promise.all(promises)).reduce((a, v) => a.concat(v), []);
    }

    async getCommentsPushShift(threadId: string) {
        const elasticQuery = {
            query: {
                match: {
                    link_id: toBase10(threadId)
                }
            },
            size: 20000,
            _source: [
                'author', 'body', 'created_utc', 'parent_id', 'score', 'subreddit', 'link_id'
            ]
        }

        let response = await fetch('https://elastic.pushshift.io/rc/comments/_search?source=' + JSON.stringify(elasticQuery));
        let json = await response.json();

        const comments = json.hits.hits
        return comments.map(comment => {
            comment._source.id = toBase36(comment._id)
            comment._source.link_id = toBase36(comment._source.link_id)
            // Missing parent id === direct reply to thread
            if (!comment._source.parent_id) {
                comment._source.parent_id = threadId
            } else {
                comment._source.parent_id = toBase36(comment._source.parent_id)
            }
            return comment._source;
        });
    }
}
