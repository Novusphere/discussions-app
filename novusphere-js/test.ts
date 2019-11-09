import { discussions } from './index';

(async function() {
    
    let x = await discussions.getPostsForSubs(['all']);
    console.log(x.cursorId);
    x.posts.forEach(p => console.log(p.uuid));

    x = await discussions.getPostsForSubs(['all'], x.cursorId);
    console.log(x.cursorId);
    x.posts.forEach(p => console.log(p.uuid));

})();
