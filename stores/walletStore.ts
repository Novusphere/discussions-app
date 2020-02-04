import { RootStore } from '@stores/index'
import { persist } from 'mobx-persist'
import { observable } from 'mobx'
import { eos, nsdb } from '@novuspherejs'
import { isServer, sleep } from '@utils'
import { ApiGetUnifiedId } from '../interfaces/ApiGet-UnifiedId'

export class WalletStore {
    @persist('list')
    @observable
    supportedTokensForUID = []

    @persist('object')
    @observable
    supportedTokensImages: { [symbol: string]: string } = {}

    @observable supportedTokensForUnifiedWallet = []
    @observable selectedToken = null

    constructor(rootStore: RootStore) {
        if (!isServer) {
            this.getSupportedTokensForUnifiedWallet()
        }
    }

    getSupportedTokensForUnifiedWallet = () => {
        try {
            nsdb.getSupportedTokensForUnifiedWallet().then(async data => {
                this.setDepositTokenOptions(data)
                // this.refreshAllBalances()
                //
                // sleep(1000).then(() => {
                //     this.updateTokenImages(data)
                // })
                this.updateTokenImages(data)
            })
        } catch (error) {
            throw error
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
