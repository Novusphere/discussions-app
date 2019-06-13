//@ts-ignore
import ecc from 'eosjs-ecc';
import { Attachment, REDDIT_URL } from './attachment';
import RedditService from './service/reddit';

export default class Post {
    // Blockchain Specific
    transaction: string;
    blockApprox: number; // may not be the *exact* block the transaction occured in but "near" this block
    chain: string;

    // Post Data
    parentUuid: string;
    threadUuid: string;
    uuid: string;
    title: string;
    poster: string;
    content: string;
    createdAt: Date;
    sub: string;
    tags: string[];
    mentions: string[];
    edit: boolean;

    // Anonymous Post Data
    anonymousId: string;
    anonymousSignature: string;
    private verifyAnonymousSignature: string;

    // Attachment
    attachment: Attachment;

    // Children (thread format)
    replies: Post[];

    // State Data
    totalReplies: number; // only used if isOpeningPost()
    score: number; // only used if isOpeningPost()
    votes: number;

    // Aggregate Data
    alreadyVoted: boolean; // have I already voted for this post?

    hasAttachment(): boolean {
        return (this.attachment.value != '' && this.attachment.type != '' && this.attachment.display != '');
    }

    isOpeningPost(): boolean {
        return (this.uuid != '' && this.uuid == this.threadUuid);
    }

    isAnonymousVerified(): boolean {
        if (!this.verifyAnonymousSignature) {
            if (!ecc.isValidPublic(this.anonymousId)) {
                this.verifyAnonymousSignature = 'INVALID_PUB_KEY';
                return false;
            }
            this.verifyAnonymousSignature = ecc.recover(this.anonymousSignature, this.content);
        }

        return (this.verifyAnonymousSignature == this.anonymousId);
    }

    constructor(chain: string) {
        this.transaction = '';
        this.blockApprox = 0;
        this.chain = chain;
        this.parentUuid = '';
        this.threadUuid = '';
        this.uuid = '';
        this.title = '';
        this.poster = '';
        this.content = '';
        this.createdAt = new Date(0);
        this.sub = '';
        this.tags = [];
        this.mentions = [];
        this.edit = false;
        this.anonymousId = '';
        this.anonymousSignature = '';
        this.verifyAnonymousSignature = '';
        this.attachment = new Attachment();
        this.replies = [];
        this.totalReplies = 0;
        this.score = 0;
        this.votes = 0;
        this.alreadyVoted = false;
    }

    applyEdit(p: Post) {
        if (!p.edit || p.parentUuid != this.uuid) return;
        if (p.chain != this.chain) return;
        if (p.poster != this.poster) return;
        if (this.anonymousId || p.anonymousId) {
            if (p.anonymousId != this.anonymousId) return;
            if (!this.isAnonymousVerified() || !p.isAnonymousVerified()) return;
        }

        this.content = p.content;
        this.createdAt = p.createdAt;
        this.tags = p.tags;
        this.mentions = p.mentions;
        this.edit = true;

        this.anonymousId = p.anonymousId;
        this.anonymousSignature = p.anonymousSignature;
        this.verifyAnonymousSignature = p.verifyAnonymousSignature;

        this.attachment = p.attachment;
    }

    private autoImage() {
        const IMAGE_URL = /(.|)http[s]?:\/\/(\w|[:\/\.%-])+\.(png|jpg|jpeg|gif)(\?(\w|[:\/\.%-])+)?(.|)/gi;
        this.content = this.content.replace(IMAGE_URL, (link) => {
            let trimmedLink = link.trim();
            if (!trimmedLink.startsWith('http')) {
                return link;
            }
            return `<img href="${trimmedLink}" />`;
        });
    }

    async normalize() {
        this.autoImage();
        await this.attachment.normalize();
    }
}