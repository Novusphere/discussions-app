const fetch = require('node-fetch');
import { DiscoveryData, WalletAuth, Wallet, WalletAccessContext, NetworkConfig } from 'eos-transit';
import { IToken, getTokens, IAccountBalance, getAccountTokens } from './tokens';

export const DEFAULT_EOS_NETWORK: NetworkConfig = {
    host: 'eos.greymass.com',
    port: 443,
    protocol: 'https',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
}

export class EOS {
    accessContext?: WalletAccessContext;
    wallet?: Wallet;
    discoveryData?: DiscoveryData;
    tokens?: IToken[];

    get accountName() : string | undefined {
        return this.wallet && this.wallet.auth ? this.wallet.auth.accountName : undefined;
    }

    get auth(): WalletAuth | undefined {
        return this.wallet ? this.wallet.auth : undefined;
    }

    constructor() {

    }

    async init(network: NetworkConfig) {
        if (process.browser) { // client?
            const transit = await import('eos-transit');

            const scatter  = await import('eos-transit-scatter-provider');
            const lynx  = await import('eos-transit-lynx-provider');
            const tokenpocket  = await import('eos-transit-tokenpocket-provider');
            const meetone  = await import('eos-transit-meetone-provider');

            this.accessContext = transit.initAccessContext({
                appName: 'discussions',
                network: network,
                walletProviders: [
                    lynx.default(),
                    tokenpocket.default(),
                    meetone.default(),
                    scatter.default()
                ]
            });
        }

        this.tokens = await getTokens();
    }

    private async tryConnectWallet(selectedProvider) {
        if (!this.accessContext) return;
        const wallet = this.accessContext.initWallet(selectedProvider);

        await wallet.connect();

        if (this.wallet)
            throw new Error('Already have a wallet present');
        else if (!wallet.connected)
            throw new Error('Failed to connect');

        const discoveryData = (await wallet.discover({ pathIndexList: [0] }));

        // TO-DO: ledger

        this.wallet = wallet;
        this.discoveryData = discoveryData;

        console.log('Detected and connected to ' + selectedProvider.meta.name);
        if (discoveryData.keyToAccountMap.length > 0) {
            console.log(discoveryData);
        }
    }

    async detectWallet(attempts: number = 1): Promise<Wallet | boolean> {
        if (!this.accessContext) return false;
        const providers = this.accessContext.getWalletProviders();
        for (let i = 0; i < attempts && !this.wallet; i++) {
            console.log('Wallet detection round ' + i);

            if (navigator.userAgent.toLowerCase().includes('meet.one')) {
                const provider = providers.find(p => p.id == 'meetone_provider');
                if (provider) {
                    try { await this.tryConnectWallet(provider); }
                    catch (ex) { console.log('Undetected ' + provider.id); }
                }
            }
            else {

                var promises = providers.map(p => new Promise(async (resolve) => {
                    try { await this.tryConnectWallet(p); }
                    catch (ex) { console.log('Undetected ' + p.id); }
                    return resolve();
                }));

                await Promise.all(promises);
            }
        }

        return this.wallet
    }

    async transact(actions: any): Promise<string | undefined> {
        if (!this.wallet) return undefined;

        const auth = this.auth;
        if (!auth) return undefined;

        if (!Array.isArray(actions)) {
            actions = [actions]; // single action
        }

        let transitActions = actions.map(a => ({
            ...a,
            authorization: [
                {
                    actor: auth.accountName,
                    permission: auth.permission
                }
            ]
        }));

        let tx: any = await this.wallet.eosApi
            .transact({ actions: transitActions },
                {
                    broadcast: true,
                    blocksBehind: 3,
                    expireSeconds: 180
                }
            );

        return tx ? tx.transaction_id : undefined;
    }
    async getTransaction(txid: string) {
        if (!this.wallet) return undefined;

        const eos = this.wallet.eosApi;
        const tx = (await eos.rpc.history_get_transaction(txid));
        return tx;
    }
    async getToken(account: string, symbol: string): Promise<IToken | undefined> {
        if (!this.tokens) return undefined;
        return this.tokens.find(t => t.account == account && t.symbol == symbol);
    }
    async getSuggestAccounts(accountPartial: string, limit: number = 10): Promise<string[]> {
        let request = await fetch(`https://www.api.bloks.io/topholders?account_name[$search]=${accountPartial}&$limit=${limit}`);
        let json = await request.json();
        return json.data.map(d => d.account_name);
    }

    /**
     * Returns non-zero balances for a given username.
     * @param account {string} - The name of the account (username)
     * @returns {IAccountBalance[]}
     */
    async getAccountTokens(account: string): Promise<IAccountBalance[]> {
        if (!this.tokens) return [];
        return getAccountTokens(account, this.tokens);
    }

    async login(account?: string, permission?: string): Promise<boolean> {
        if (!this.wallet) return false;
        await this.wallet.login(account, permission);

        if (this.auth) {
            window.dispatchEvent(new Event('eosAccountChange'));
            return true;
        }
        return false;
    }
    async logout() {
        if (!this.wallet) return;
        await this.wallet.logout();

        if (!this.auth) {
            window.dispatchEvent(new Event('eosAccountChange'));
        }
    }
}