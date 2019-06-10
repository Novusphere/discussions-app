import NSDB from '../../nsdb';
import Post from '../post';

export default class DiscussionsService {
    nsdb : NSDB;

    constructor() {
        this.nsdb = new NSDB();
    }

    getPostsForSubs(subs : string[]) : Post[] {
        throw new Error('Not implemented');
    }
    
    getPostsForTags(tags: string[]) : Post[] {
        throw new Error('Not implemented');
    }
};