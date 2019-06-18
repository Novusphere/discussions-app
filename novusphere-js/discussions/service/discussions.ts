import {NSDB} from '../../nsdb';
import Post from '../post';
import Thread from "../thread";

export default class DiscussionsService {
    nsdb: NSDB;

    constructor() {
        this.nsdb = new NSDB();
    }

    async getThread(_chain: string, _id: number): Promise<Thread | undefined> {
        throw new Error('Not implemented');
    }

    async getPostsForSubs(_subs: string[]): Promise<Post[]> {
        throw new Error('Not implemented');
    }

    async getPostsForTags(_tags: string[]): Promise<Post[]> {
        throw new Error('Not implemented');
    }
};
