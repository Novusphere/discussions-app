import {
    DiscussionService,
    Post,
    AttachmentType,
    AttachmentDisplay,
    Attachment
} from './discussions';
import NSDB from './nsdb';

const discussions = new DiscussionService();
const nsdb = new NSDB();

export {
    // helper objects
    discussions,
    nsdb,

    // types
    Post,
    AttachmentType,
    AttachmentDisplay,
    Attachment
}
