import axios from 'axios'
import { ApiGetUnifiedId } from 'interfaces/ApiGet-UnifiedId'
const ecc = require('eosjs-ecc')
export const DEFAULT_NSDB_ENDPOINT = 'https://atmosdb.novusphere.io'

export interface INSDBSearchQuery {
    cursorId?: number
    pipeline: any[]
    payload?: any
    count?: number
    limit?: number
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

    async getAccount(privateKey: string) {
        const time = new Date().getTime()
        const sig = ecc.sign(ecc.sha256(`discussions-${time}`), privateKey)
        const pub = ecc.privateToPublic(privateKey)

        const qs = `pub=${pub}&sig=${sig}&time=${time}`
        const rurl = `${this.api}/discussions/account/data`

        const { data } = await axios.post(rurl, qs)

        if (data.error) {
            console.error('Get account failed: ', qs)
            throw new Error(data.message)
        }

        return data.payload
    }

    async saveAccount(privateKey: string, accountData: any) {
        const jsonData = JSON.stringify(accountData)
        const sig = ecc.sign(ecc.sha256(jsonData), privateKey)
        const pub = ecc.privateToPublic(privateKey)

        const qs = `pub=${pub}&sig=${sig}&data=${encodeURIComponent(jsonData)}`
        const rurl = `${this.api}/discussions/account/save`

        const { data } = await axios.post(rurl, qs)
        if (data.error) {
            throw new Error(data.error)
        }

        return data.payload
    }

    async cors(url: string) {
        const request = await axios.get(`https://db.novusphere.io/service/cors/?${url}`)
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
