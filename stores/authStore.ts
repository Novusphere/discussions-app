import { observable } from 'mobx'
import { RootStore } from '@stores'

export class AuthStore {
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

    constructor(rootStore: RootStore) {
    }
}
