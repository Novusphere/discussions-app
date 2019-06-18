import {extendObservable, observable} from 'mobx';
import {discussions} from "@novuspherejs/index";

const defaultState = {};

export interface IAttachment {
    value: string;
    type: string;
    display: string;
}

export interface IPost {
    id: number;
    transaction: string;
    blockApprox: number;
    chain: string;
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
    anonymousId: string;
    anonymousSignature: string;
    verifyAnonymousSignature: string;
    attachment: IAttachment;
    replies: any[];
    totalReplies: number;
    score: number;
    votes: number;
    alreadyVoted: boolean;
}

export default class Posts {
    @observable posts: IPost[] = [];

    /**
     * Must have constructor to set default state from SSR
     * @param Posts
     */
    constructor(Posts = null) {
        extendObservable(this, Posts || defaultState);

        discussions.getPostsForTags(['all']).then(data => {
            this.posts = data as unknown as IPost[]
        })
    }
};
