import { discussions } from './index';

(async function() {
    
    let test = await discussions.getPostsForSubs(['all']);
    console.log(test);

})();
