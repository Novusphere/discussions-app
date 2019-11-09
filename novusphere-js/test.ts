import { discussions } from './index';

(async function() {
    
    // 1573264557216
    // 1573265590000
    let lastCheck = 1573264557216;

    let thread = await discussions.getThread('l3qc3wjcmeoc');

    console.log(thread);
    
})();
