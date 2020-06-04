import { nsdb, discussions, eos } from './index'
const ecc = require('eosjs-ecc')

;(async function() {
    console.log(
        await discussions.getPostsByTransaction(
            { transactions: '627eb32c34723c487023b428aa6f01022be64ff7b2f5e2d10cb61dc524f80ca3' }
        )
    )
})()
