import axios from 'axios';

export const DEFAULT_NSDB_ENDPOINT = 'https://atmosdb.novusphere.io';

export interface INSDBSearchQuery {
    cursorId?: number;
    pipeline: any[];
    payload?: any;
    count?: number;
    limit?: number;
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
        const request = await axios.get(`https://db.novusphere.io/service/cors/?${url}`);
        const result = request.data;
        return result;
    }

    async search(sq : INSDBSearchQuery) : Promise<INSDBSearchQuery> {
        sq.payload = undefined;

        const qs = `data=${JSON.stringify(sq)}`;
        const rurl = `${this.api}/discussions/search?${qs}`;
        
        console.log('Class: NSDB, Function: search, Line 35 rurl: ', rurl);

        try {
            const request = await axios.get(rurl);
            
            console.log('Class: NSDB, Function: search, Line 40 request: ', request);
            
            const result = request.data;

            if (result.error) {
                console.log(result);
                throw new Error(result.error);
            }

            sq.cursorId = result.cursorId;
            sq.count = result.count;
            sq.limit = result.limit;
            sq.payload = result.payload;

            return sq;
        } catch(error) {
            console.error('Search error: \n', error)
            throw error
        }
    }
};
