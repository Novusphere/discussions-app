import { initAccessContext, DiscoveryData, WalletAuth, Wallet, WalletAccessContext, NetworkConfig } from 'eos-transit';
import scatter from 'eos-transit-scatter-provider';
import lynx from 'eos-transit-lynx-provider';
import tokenpocket from 'eos-transit-tokenpocket-provider';
import meetone from 'eos-transit-meetone-provider';
import { IToken, getTokens } from './tokens';

export class EOS {
    accessContext?: WalletAccessContext;
    wallet?: Wallet;
    discoveryData?: DiscoveryData;
    tokens?: IToken[];

    get auth(): WalletAuth | undefined {
        return this.wallet ? this.wallet.auth : undefined;
    }

    constructor() {

    }

    async init(network: NetworkConfig) {
        this.accessContext = initAccessContext({
            appName: 'discussions',
            network: network,
            walletProviders: [
                lynx(),
                tokenpocket(),
                meetone(),
                scatter()
            ]
        });

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

    async detectWallet(attempts: number = 1): Promise<boolean> {
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

        return this.wallet != undefined;
    }
    async transact(actions: any): Promise<string | undefined> {
        if (!this.wallet) return undefined;

        const auth = this.auth;
        if (!auth) return undefined;

        if (!Array.isArray(actions)) {
            actions = [actions]; // single action
        }

        let transitActions = actions.map(a => ({
            account: a.account,
            name: a.name,
            authorization: [
                {
                    actor: auth.accountName,
                    permission: auth.permission
                }
            ],
            data: a.data
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
    async login(accountName?: string, permission?: string) {
        if (!this.wallet) return;
        await this.wallet.login(accountName, permission);
    }
    async logout() {
        if (!this.wallet) return;
        await this.wallet.logout();
    }
}

export const DEFAULT_EOS_NETWORK: NetworkConfig = {
    host: 'eos.greymass.com',
    port: 443,
    protocol: 'https',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
}