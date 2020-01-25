import _ from 'lodash'

export default async (req, res) => {
    let { token, amount, memoId, actor, p2k } = req.query
    let accountNames = req.query['accountNames[]']

    if (
        _.isUndefined(req.query) ||
        _.isUndefined(accountNames) ||
        _.isUndefined(token) ||
        _.isUndefined(amount) ||
        _.isUndefined(memoId) ||
        _.isUndefined(actor)
    ) {
        return res.status(400).json({ message: 'Missing data' })
    }

    const parsedToken = JSON.parse(token)

    res.setHeader('Content-disposition', 'attachment; filename=airdrop.json')
    res.setHeader('Content-type', 'text/plain')
    res.charset = 'UTF-8'

    if (!Array.isArray(accountNames)) {
        accountNames = [accountNames]
    }

    if (!_.isUndefined(p2k)) {
        p2k = JSON.parse(p2k)


        // handle as a deposit
        res.write(
            JSON.stringify({
                rpc: 'https://eos.greymass.com',
                authorization: {
                    actor: actor,
                    permission: 'active',
                },
                contract: p2k.value,
                quantity: `${amount} ${parsedToken.symbol}`,
                memo: memoId || '',
                transfer: accountNames,
            })
        )
    } else {
        res.write(
            JSON.stringify({
                rpc: 'https://eos.greymass.com',
                authorization: {
                    actor: actor,
                    permission: 'active',
                },
                contract: parsedToken.value,
                quantity: `${amount} ${parsedToken.symbol}`,
                memo: memoId || '',
                transfer: accountNames,
            })
        )
    }

    res.end()
}
