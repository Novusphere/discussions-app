interface P2k {
    contract: string
    chain: number
}

interface Fee {
    flat: number
    percent: number
}

interface Coin {
    symbol: string
    contract: string
    precision: number
    min: number
    p2k: P2k
    fee: Fee
}

export type ApiGetUnifiedId = [Coin]
