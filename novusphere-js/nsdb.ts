const fetch = require('node-fetch');

export const DEFAULT_NSDB_ENDPOINT = 'https://atmosdb.novusphere.io';

export interface INSDBSearchQuery {
    cursorId?: number;
    query: any;
    sort?: any;
    account?: string;
    payload?: any;
    count?: number;
    limit?: number;
}

export class NSDB {
    api: string;
    constructor() {
        this.api = DEFAULT_NSDB_ENDPOINT;
    }
    async init(apiEndpoint: string) {
        this.api = apiEndpoint;
    }
    async cors(url: string) {
        const request = await fetch(`https://db.novusphere.io/service/cors/?${url}`);
        const result = await request.text();
        return result;
    }

    async search(sq : INSDBSearchQuery) : Promise<NSDBNotificationsResponse.RootObject> {
        const qs =
            `c=${sq.cursorId ? sq.cursorId : ''}&` +
            `q=${sq.query ? JSON.stringify(sq.query) : ''}&` +
            `s=${sq.sort ? JSON.stringify(sq.sort) : ''}&` +
            `u=${sq.account ? sq.account : ''}&` +
            `lim=${typeof sq.limit !== 'undefined' ? sq.limit : 20}&` +
            `p=${typeof sq.count !== 'undefined' ? sq.count : 0}`;

        const request = await fetch(`${this.api}/discussions/search?${qs}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
            },
        });
        
        const result = await request.json();
        if (result.error) {
            console.log(result);
            throw new Error(result.error);
        }

        sq.cursorId = result.cursorId;
        sq.count = result.count;
        sq.limit = result.limit;
        sq.payload = result.payload;

        return sq as any;
    }
};
