import { discussions } from './index';

(async function() {
    
    // 1573264557216
    // 1573265590000
    let lastCheck = 1573264557216;
    
    let test = await discussions.getPostsForNotifications(
        'EOS7iKdNSW7BfXR5uHEt7Y2F9y2QQsvpP3Q1PFLGmVXePANZ5oNHN', 
        lastCheck);
        
    console.log(test.payload.length);
    
})();
