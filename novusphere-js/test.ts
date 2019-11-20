import { nsdb, discussions } from './index';
const ecc = require('eosjs-ecc');

(async function() {
    //let privKey = await ecc.randomKey();
    //console.log(privKey);

    let privKey = '5Jje9KSdbxFQ2uUg9ed5AYAGADpZ9qqfgZ7YWK9e5nT4AisLhTT';

    const sa = await nsdb.saveAccount(privKey, { hello: 'nerd' });
    console.log(sa);

    let {pub, time, data} = await nsdb.getAccount(privKey);
    console.log(data); // { hello: 'nerd' }

})();
