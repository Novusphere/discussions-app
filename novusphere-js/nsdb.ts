import axios from 'axios'

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

    async cors(url: string) {
        const request = await axios.get(`https://db.novusphere.io/service/cors/?${url}`)
        const result = request.data
        return result
    }

    async search(sq: INSDBSearchQuery): Promise<INSDBSearchQuery> {
        sq.payload = undefined

        const qs = `data=${encodeURIComponent(JSON.stringify(sq))}`
        const rurl = `${this.api}/discussions/search?${qs}`

        try {
            const { data } = await axios.post(rurl)

            if (data.error) {
                console.error('Search failed: ', sq)
                throw new Error(data.error)
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
};
