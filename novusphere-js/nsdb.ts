import axios from 'axios'
import { ApiGetUnifiedId } from '../interfaces/ApiGet-UnifiedId'
import { getOrigin } from '@utils'
import { discussions } from '@novuspherejs/index'
import _ from 'lodash'

const ecc = require('eosjs-ecc')
export const DEFAULT_NSDB_ENDPOINT = 'https://atmosdb.novusphere.io'

export interface INSDBSearchQuery {
    mods?: string[]
    sort?: string
    cursorId?: number
    pipeline: any[]
    payload?: any
    count?: number
    limit?: number
    key?: string
    op?: boolean
}

export class NSDB {
    api: string
    constructor() {
        this.api = DEFAULT_NSDB_ENDPOINT
    }

    async init(apiEndpoint: string) {
        this.api = apiEndpoint
    }

    async searchForUserByName(name: string) {
        try {
            let url = `${this.api}/discussions/search/user?domain=${getOrigin()}&name=${name}`
            const { data } = await axios.get(url)
            return data
        } catch (error) {
            throw error
        }
    }

    async getTrendingsTags(all = false): Promise<any> {
        try {
            let url = `${this.api}/discussions/search/trendingtags`

            if (all) {
                url += '?days=30&count=100'
            }

            const { data } = await axios.get(url)
            return data
        } catch (error) {
            throw error
        }
    }

    async getSupportedTokensForUnifiedWallet(): Promise<ApiGetUnifiedId> {
        try {
            const { data } = await axios.get<ApiGetUnifiedId>(`${this.api}/unifiedid/p2k`)
            return data
        } catch (error) {
            throw error
        }
    }

    async getAccount({ accountPrivateKey, accountPublicKey }: any) {
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

    async saveAccount({ accountPrivateKey, accountPublicKey, accountData }: any) {
        const jsonData = JSON.stringify(accountData)
        const sig = ecc.sign(ecc.sha256(jsonData), accountPrivateKey)
        const qs = `pub=${accountPublicKey}&sig=${sig}&data=${encodeURIComponent(
            jsonData
        )}&domain=${getOrigin()}`
        const rurl = `${this.api}/account/save`

        try {
            const { data } = await axios.post(rurl, qs)
            if (data.error) {
                throw new Error(data.message)
            }

            return data.payload
        } catch (error) {
            throw error
        }
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

    async connectTwitter({ accountPrivateKey, accountPublicKey }: any) {
        try {
            const time = new Date().getTime()
            const sig = ecc.sign(ecc.sha256(`${getOrigin()}-${time}`), accountPrivateKey)
            const pub = accountPublicKey
            const redirect = window.location.href

            const qs = `pub=${pub}&sig=${sig}&time=${time}&domain=${getOrigin()}&redirect=${redirect}`
            const rurl = `${this.api}/account/auth/twitter`
            window.location.replace(`${rurl}?${qs}`)
        } catch (error) {
            throw error
        }
    }

    async disconnectTwitter({ accountPrivateKey, accountPublicKey }: any) {
        try {
            const time = new Date().getTime()
            const sig = ecc.sign(ecc.sha256(`${getOrigin()}-${time}`), accountPrivateKey)
            const pub = accountPublicKey
            const qs = `pub=${pub}&sig=${sig}&time=${time}&domain=${getOrigin()}`
            const rurl = `${this.api}/account/auth/twitter/unlink`
            const { data } = await axios.get(`${rurl}?${qs}`)
            if (!data.payload || data.error) {
                throw new Error('Failed to disconnect Twitter account')
            }
        } catch (error) {
            throw error
        }
    }

    async setTagsAsync({
        accountPrivateKey,
        accountPublicKey,
        uuid,
        tags,
    }: {
        accountPrivateKey: string
        accountPublicKey: string
        uuid: string
        tags: string
    }) {
        console.log('got tags: ', JSON.stringify(tags))
        try {
            const time = new Date().getTime()
            const sig = ecc.sign(ecc.sha256(`${getOrigin()}-${time}`), accountPrivateKey)
            const pub = accountPublicKey
            const qs = `pub=${pub}&sig=${sig}&time=${time}&domain=${getOrigin()}&uuid=${uuid}&tags=${tags}`
            const rurl = `${this.api}/discussions/moderation/settags`
            const { data } = await axios.get(`${rurl}?${qs}`)
            if (data.error) {
                throw new Error('Failed to set tags for post')
            }
        } catch (error) {
            throw error
        }
    }

    async getPinnedPostByModAndTag({
        mods,
        tag,
        key = '',
    }: {
        mods: string[]
        tag: string
        key?: string
    }) {
        try {
            if (key) {
                mods.push(key)
            }

            const { data } = await axios.get(
                `${this.api}/discussions/moderation/pinned?mods=${mods
                    .filter(Boolean)
                    .join(',')}&tags=${tag}&domain=${getOrigin()}`
            )

            return await discussions.getPostsByTransaction({
                mods: mods,
                transactions: _.map(_.groupBy(data, "transaction"), (p, key) => key),
                key,
            })
        } catch (error) {
            throw error
        }
    }
}
