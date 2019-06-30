import { action, computed, extendObservable, observable } from 'mobx'
import { task } from 'mobx-task'
import { eos } from '@novuspherejs/index'

const defaultState = {
    accountName: '',
    permission: '',
    publicKey: '',
}

export default class Auth {
    @observable accountName = ''
    @observable permission = ''
    @observable publicKey = ''
    @observable balances = observable.map<string, number>()

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

    @computed get ATMOSBalance(): number | undefined {
        return this.balances.get('ATMOS')
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

    @task.resolved logIn = async () => {
        await eos.login()
        if (eos.auth) {
            this.setAuth(eos.auth)

            // fetch balances
            const whiteList = ['ATMOS']

            await Promise.all(
                whiteList.map(async whiteListToken => {
                    eos.tokens.map(async token => {
                        if (token.name === whiteListToken) {
                            const balances = await eos.getAccountTokens(token.account)

                            balances.forEach(balance => {
                                this.balances.set(balance.token.name, balance.amount)
                            })
                        }
                    })
                })
            )
        }
    }

    @task.resolved logOut = async () => {
        await eos.logout()
        this.clearAuth()
    }
}
