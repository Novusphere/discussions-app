import _ from 'lodash'

export default async (req, res) => {
    const { token, amount, memoId, actor } = req.query
    const accountNames = req.query['accountNames[]']

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

    res.end()
}
