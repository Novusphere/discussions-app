import {
    DiscussionService,
    Post,
    AttachmentType,
    AttachmentDisplay,
    Attachment,
    Thread
} from './discussions';
import NSDB from './nsdb';
import RedditService from './discussions/service/reddit';

const reddit = new RedditService();
const discussions = new DiscussionService();
const nsdb = new NSDB();

export {
    // helper objects
    discussions,
    nsdb,
    reddit,

    // types
    Post,
    AttachmentType,
    AttachmentDisplay,
    Attachment,
    Thread
}
