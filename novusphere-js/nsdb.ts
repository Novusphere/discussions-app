const fetch = require('node-fetch');

export const DEFAULT_NSDB_ENDPOINT = 'https://atmosdb.novusphere.io';

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
    async search(c: any, q: any, s: any) {
        const qs = `c=${c ? c : ''}&q=${q ? JSON.stringify(q) : ''}&s=${s ? JSON.stringify(s) : ''}`;
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
        return result;
    }
};