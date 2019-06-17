export const DEFAULT_NSDB_ENDPOINT = 'https://db.novusphere.io';

export class NSDB {
    api: string;
    constructor() {
        this.api = DEFAULT_NSDB_ENDPOINT;
    }
    async init(apiEndpoint: string) {
        this.api = apiEndpoint;
    }
    async cors(url: string) {
        const request = await window.fetch(`${this.api}/service/cors/?${url}`);
        const result = await request.text();
        return result;
    }
    async queryOne(q: any) {
        const result = await this.query(q);
        if (!result) return undefined;
        if (!result.cursor) return undefined;
        if (!result.cursor.firstBatch) return undefined;
        if (!result.cursor.firstBatch.length) return undefined;
        return result.cursor.firstBatch[0];
    }
    async query(q: any) {
        const request = await window.fetch(`${this.api}/api`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(q)
        });
        const result = await request.json();
        if (result.error) {
            console.log(q);
            console.log(result);
            throw new Error(result.error);
        }
        return result;
    }
    async isAccountAuthorized(sessionKey: string, name: string, key: string) {
        let endpoint = `${this.api}/service/accountstate/authorized?` +
            `sessionKey=${sessionKey}&` +
            `key=${key}&` +
            `name=${name}&`;

        const request = await window.fetch(endpoint);
        const result = await request.json();

        if (result.error) return undefined;
        return result.authorized;
    }
    async authorizeAccount(name: string, key: string, nonce: number, sig: string) {
        const request = await window.fetch(`${this.api}/service/accountstate/authorize`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                key: key,
                nonce: nonce,
                sig: sig
            })
        });
        const result = await request.json();
        return result;
    }
    async saveAccount(state: any) {
        const request = await window.fetch(`${this.api}/service/accountstate/save`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(state)
        });
        const result = await request.json();
        return result;
    }
    async getAccount(nameOrKey: string) {
        const endpoint = `${this.api}/service/accountstate/get` +
            (nameOrKey.length >= 13) ?
            `?key=${nameOrKey}` :
            `?name=${nameOrKey}`;

        const request = await window.fetch(endpoint);
        const result = await request.json();

        if (result.error) return undefined;
        return result;
    }
};