import { NSDBNotificationsResponse } from 'interfaces/NSDBNotifications'

// const fetch = require('node-fetch');

import axios from 'axios'

const querystring = require('querystring')

export const DEFAULT_NSDB_ENDPOINT = 'https://atmosdb.novusphere.io'

export interface INSDBSearchQuery {
    cursorId?: number
    query: any
    sort?: any
    account?: string
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
        const request = await fetch(`https://db.novusphere.io/service/cors/?${url}`)
        const result = await request.text()
        return result
    }

    async search(sq: INSDBSearchQuery): Promise<NSDBNotificationsResponse> {
        try {
            const { data } = await axios.get(`${this.api}/discussions/search`, {
                params: {
                    c: sq.cursorId || '',
                    q: JSON.stringify(sq.query) || '',
                    sort: sq.sort || '',
                    account: sq.account || '',
                    limit: sq.limit || 20,
                    count: sq.count || 0,
                },
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'text/plain',
                },
            })

            const result = data

            if (typeof result.error !== 'undefined' && result.error) {
                throw new Error(result.error)
            }

            sq.cursorId = result.cursorId
            sq.count = result.count
            sq.limit = result.limit
            sq.payload = result.payload

            return sq as any
        } catch (error) {
            throw error
        }
    }
};
