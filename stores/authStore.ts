import { action, observable } from 'mobx'
import { RootStore } from '@stores'
import { SIGN_IN_OPTIONS } from '@globals'

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
    hasAccount = false

    @observable
    hasEOSWallet = false

    constructor(rootStore: RootStore) {}

    @action.bound
    setPreferredSignInMethod(method: SIGN_IN_OPTIONS) {
        if (this.preferredSignInMethod === method) this.preferredSignInMethod = SIGN_IN_OPTIONS.none
        else this.preferredSignInMethod = method
    }
}
