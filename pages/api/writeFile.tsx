export default async (req, res) => {
    const { accountNames, token, amount, memoId, actor } = req.query

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
            contract: parsedToken.label,
            quantity: `${amount} ${parsedToken.value}`,
            memo:
                memoId ||
                'Thanks for reading The Blockchain Normie! Keep up with the latest discussions on the stories at: https://beta.discussions.app/tag/blockchainnormies/2m9sh509np65m/blockchain_for_normies_beta_newsletter',
            transfer: accountNames.split(','),
        })
    )

    res.end()
}
