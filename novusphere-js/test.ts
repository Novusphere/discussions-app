import { discussions } from './index';

(async function() {
    let n = await discussions.getThreadReplyCount('2nwvnkrikmq30');
    console.log(n);
})();
