import { discussions } from './index';

(async function() {
    let { posts, cursorId } = await discussions.getPostsForKeys([
        'EOS7frg1UPi5A18ydkVS2WxN8RSh7CTTHQJV52EasEsipash18JFh',
        'EOS8YDTmZcDMHZP8DgBSeFXRvLiQP6XxWP78ThaciDF4eVXZxw1Sk'
    ])

    console.log(posts.map(p => p.displayName));
})();
