export interface IToken {
    name: string;
    logo: string;
    logo_lg: string;
    symbol: string;
    account: string;
}

export interface IAccountBalance {
    amount: number;
    token: IToken;
}

export async function getTokens() : Promise<IToken[]> {
    const TOKEN_ENDPOINTS = [
        "https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/tokens.json",
        "https://raw.githubusercontent.com/Novusphere/eos-forum-settings/master/tokens.json"
    ];
    
    let tokens : IToken[] = [];

    for (let i = 0; i < TOKEN_ENDPOINTS.length; i++) {
        let request = await window.fetch(TOKEN_ENDPOINTS[i]);
        let json = await request.json();
        for (let key in json) {
            if (key in tokens) {
                Object.assign(tokens[key], json[key]);
            }
            else {
                tokens[key] = json[key];
            }
        }
    }

    return tokens;
}

export async function getAccountTokens(account: string, tokens: IToken[]) : Promise<IAccountBalance[]> {
    let balances: IAccountBalance[] = [];

    let request = await window.fetch(`https://www.api.bloks.io/account/${account}?type=getAccountTokens`);
    let json = await request.json();

    for (let i = 0; i < json.tokens.length; i++) {
        let token = json.tokens[i];
        let info = tokens.find(t => t.account == token.contract && t.symbol == token.currency);
        if (info)
            balances.push({ amount: token.amount, token: info });
    }

    return balances;
}