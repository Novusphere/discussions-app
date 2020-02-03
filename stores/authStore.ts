import { action, observable, set } from 'mobx'
import { SIGN_IN_OPTIONS } from '@globals'
import { RootStore } from '@stores'

export class AuthStore {
    @observable
    preferredSignInMethod: SIGN_IN_OPTIONS = SIGN_IN_OPTIONS.brainKey

    @observable
    displayName = ''

    @observable
    uidwWalletPubKey = ''

    @observable
    postPriv = ''

    @observable
    postPub = ''

    @observable
    hasAccount = false

    @observable
    hasEOSWallet = false

    @observable supportedTokensForUnifiedWallet = []
    @observable supportedTokensImages: { [symbol: string]: string } = {}

    constructor(rootStore: RootStore) {
    }

    @action.bound
    setPreferredSignInMethod(method: SIGN_IN_OPTIONS) {
        if (this.preferredSignInMethod === method) this.preferredSignInMethod = SIGN_IN_OPTIONS.none
        else this.preferredSignInMethod = method
    }
}
