import { RootStore } from '@stores/index'
import { persist } from 'mobx-persist'
import { observable } from 'mobx'
import { eos, nsdb } from '@novuspherejs'
import { isServer, sleep } from '@utils'
import { ApiGetUnifiedId } from '../interfaces/ApiGet-UnifiedId'
import { AuthStore } from '@stores/authStore'

export class WalletStore {
    @persist('list')
    @observable
    supportedTokensForUID = []

    @persist('object')
    @observable
    supportedTokensImages: { [symbol: string]: string } = {}

    @observable supportedTokensForUnifiedWallet = []
    @observable selectedToken = null

    balances = observable.map<string, string>()

    @observable authStore: AuthStore

    constructor(rootStore: RootStore) {
        this.authStore = rootStore.authStore
    }

    getSupportedTokensForUnifiedWallet = () => {
        try {
            nsdb.getSupportedTokensForUnifiedWallet().then(async data => {
                this.setDepositTokenOptions(data)
                this.refreshAllBalances()
                await this.supportedTokensForUnifiedWallet.map(async datum => {
                    await sleep(250)
                })
                this.updateTokenImages(data)
            })
        } catch (error) {
            throw error
        }
    }

    async refreshAllBalances() {
        try {
            await sleep(250)
            await this.supportedTokensForUnifiedWallet.map(async datum => {
                await sleep(250)
                await this.fetchBalanceForSelectedToken(datum)
            })
        } catch (error) {
            throw error
        }
    }

    fetchBalanceForSelectedToken = async (token = this.selectedToken) => {
        try {
            let symbol, chain, contract

            if (!token.hasOwnProperty('symbol')) {
                symbol = token.label
                chain = token.chain
                contract = token.contract
            } else {
                symbol = token.symbol
                chain = token.p2k.chain
                contract = token.p2k.contract
            }

            let balance = await eos.getBalance(this.authStore.uidwWalletPubKey, chain, contract)

            if (!balance.length) {
                return
            }

            this.balances.set(symbol, balance[0].amount)
        } catch (error) {
            return error
        }
    }

    setDepositTokenOptions = (depositTokens: ApiGetUnifiedId) => {
        let tokens = []

        this.supportedTokensForUnifiedWallet = depositTokens.map(token => {
            tokens.push(token.symbol)

            return {
                label: token.symbol,
                value: token.contract,
                contract: token.p2k.contract,
                chain: token.p2k.chain,
                decimals: token.precision,
                fee: token.fee,
                min: token.min,
            }
        })

        this.selectedToken = this.supportedTokensForUnifiedWallet[0]

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('supp_tokens', tokens.join('|'))
        }
    }

    updateTokenImages = depositTokens => {
        depositTokens.map(token => {
            if (
                !this.supportedTokensImages ||
                !this.supportedTokensImages.hasOwnProperty(token.symbol)
            ) {
                let logo

                if (!eos.tokens) return

                const tokenFromList = eos.tokens.find(t => t.name === token.symbol)

                if (tokenFromList) {
                    logo = tokenFromList.logo
                }

                this.supportedTokensImages = {
                    ...this.supportedTokensImages,
                    [token.symbol]: [logo, token.precision],
                }
            }
        })
    }
}
