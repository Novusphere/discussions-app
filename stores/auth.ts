import { action, computed, extendObservable, observable } from 'mobx'

const defaultState = {
    accountName: '',
    permission: '',
    publicKey: '',
}

export default class Auth {
    @observable accountName = ''
    @observable permission = ''
    @observable publicKey = ''

    /**
     * Must have constructor to set default state from SSR
     * @param Auth
     */
    constructor(Auth = null) {
        extendObservable(this, Auth || defaultState)
    }

    @computed get isLoggedIn(): boolean {
        return this.accountName !== '' && this.permission !== '' && this.publicKey !== ''
    }

    @action clearAuth = () => {
        this.accountName = ''
        this.permission = ''
        this.publicKey = ''
    }

    @action setAuth = (eosAuthObject: {
        accountName: string
        permission: string
        publicKey: string
    }) => {
        this.accountName = eosAuthObject.accountName
        this.permission = eosAuthObject.permission
        this.publicKey = eosAuthObject.publicKey
    }
}
