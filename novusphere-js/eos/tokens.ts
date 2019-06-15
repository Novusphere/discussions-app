export interface IToken {
    name: string;
    logo: string;
    logo_lg: string;
    symbol: string;
    account: string;
}

const TOKEN_ENDPOINTS = [
    "https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/tokens.json",
    "https://raw.githubusercontent.com/Novusphere/eos-forum-settings/master/tokens.json"
];

export async function getTokens() : Promise<IToken[]> {
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