import axios from 'axios'
import { ApiGetUnifiedId } from '../interfaces/ApiGet-UnifiedId'
import { getHostName, isDev, getOrigin } from '@utils'
const ecc = require('eosjs-ecc')
export const DEFAULT_NSDB_ENDPOINT = 'https://atmosdb.novusphere.io'

export interface INSDBSearchQuery {
    cursorId?: number
    pipeline: any[]
    payload?: any
    count?: number
    limit?: number
    key?: string
}

export class NSDB {
    api: string
    constructor() {
        this.api = DEFAULT_NSDB_ENDPOINT
    }

    async init(apiEndpoint: string) {
        this.api = apiEndpoint
    }

    async getSupportedTokensForUnifiedWallet(): Promise<ApiGetUnifiedId> {
        try {
            const { data } = await axios.get<ApiGetUnifiedId>(`${this.api}/unifiedid/p2k`)
            return data
        } catch (error) {
            throw error
        }
    }

    async getAccount({
        accountPrivateKey,
        accountPublicKey,
    }: any) {
        const time = new Date().getTime()
        const sig = ecc.sign(ecc.sha256(`${getOrigin()}-${time}`), accountPrivateKey)
        const pub = accountPublicKey

        const qs = `pub=${pub}&sig=${sig}&time=${time}&domain=${getOrigin()}`
        const rurl = `${this.api}/account/data`

        const { data } = await axios.post(rurl, qs)

        if (data.error) {
            console.error('Get account failed: ', qs)
            throw new Error(data.message)
        }

        return data.payload
    }

    async saveAccount({
        accountPrivateKey,
        accountPublicKey,
        accountData,
    }: any) {
        const jsonData = JSON.stringify(accountData)
        const sig = ecc.sign(ecc.sha256(jsonData), accountPrivateKey)
        const pub = accountPublicKey

        const qs = `pub=${pub}&sig=${sig}&data=${encodeURIComponent(jsonData)}&domain=${getOrigin()}`
        const rurl = `${this.api}/account/save`

        const { data } = await axios.post(rurl, qs)
        if (data.error) {
            throw new Error(data.error)
        }

        return data.payload
    }

    async cors(url: string) {
        const request = await axios.get(`https://atmosdb.novusphere.io/cors?${url}`)
        const result = request.data
        return result
    }

    async search(sq: INSDBSearchQuery): Promise<INSDBSearchQuery> {
        sq.payload = undefined

        const qs = `data=${encodeURIComponent(JSON.stringify(sq))}`
        const rurl = `${this.api}/discussions/search`

        try {
            const { data } = await axios.post(rurl, qs)

            if (data.error) {
                console.error('Search failed: ', sq)
                throw new Error(data.message)
            }

            sq.cursorId = data.cursorId
            sq.count = data.count
            sq.limit = data.limit
            sq.payload = data.payload

            return sq
        } catch (error) {
            console.error('Search error: \n', error)
            throw error
        }
    }
}
