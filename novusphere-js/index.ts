import {
    DiscussionService,
    RedditService,
    Post,
    AttachmentType,
    AttachmentDisplay,
    Attachment,
    Thread
} from './discussions';
import { EOS } from "./eos";
import { NSDB } from './nsdb';
import { Settings } from "./settings";

const reddit = new RedditService();
const discussions = new DiscussionService();
const nsdb = new NSDB();
const eos = new EOS();
const settings = new Settings();

export {
    // helper objects
    discussions,
    nsdb,
    reddit,
    eos,
    settings,
    // types
    Post,
    AttachmentType,
    AttachmentDisplay,
    Attachment,
    Thread
}

export async function init() {
    await settings.init();
    await eos.init(settings.eosNetwork);
}
