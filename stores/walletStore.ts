import { RootStore } from '@stores/index'
import { persist } from 'mobx-persist'
import { observable } from 'mobx'
import { eos, nsdb } from '@novuspherejs'
import { isServer, sleep } from '@utils'

export class WalletStore {
    @persist('list')
    @observable
    supportedTokensForUID = []

    @persist('object')
    @observable
    supportedTokensImages: { [symbol: string]: string } = {}

    constructor(rootStore: RootStore) {
        if (!isServer) {
            this.getSupportedTokensForUnifiedWallet()
        }
    }

    getSupportedTokensForUnifiedWallet = () => {
        try {
            nsdb.getSupportedTokensForUnifiedWallet().then(async data => {
                // this.setDepositTokenOptions(data)
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
