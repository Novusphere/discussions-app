import { nsdb, discussions, eos } from './index';
const ecc = require('eosjs-ecc');

(async function() {
    console.log(await eos.getTokenPrecision('novusphereio', 'ATMOS'));

})();
