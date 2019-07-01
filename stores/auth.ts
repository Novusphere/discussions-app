import { action, computed, observable } from 'mobx'
import { task } from 'mobx-task'
import { eos } from '@novuspherejs/index'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { getUiStore } from '@stores/ui'
import { IStores } from '@stores/index'
import { ModalOptions } from '../constants/globals'

export default class Auth extends BaseStore {
    @observable accountName = ''
    @observable permission = ''
    @observable publicKey = ''
    @observable balances = observable.map<string, number>()

    private uiStore: IStores['uiStore'] = getUiStore()

    constructor() {
        super()
    }

    @computed get isLoggedIn(): boolean {
        return this.accountName !== '' && this.permission !== '' && this.publicKey !== ''
    }

    @computed get ATMOSBalance(): number {
        return this.balances.get('ATMOS') || 0
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
        try {
            let wallet = eos.wallet

            if (typeof wallet !== 'boolean' && wallet) {
                await eos.login()
                console.log(eos.auth)
                if (eos.auth) {
                    this.setAuth(eos.auth)

                    // fetch balances
                    const balances = await eos.getAccountTokens(this.accountName)
                    balances.forEach(balance => {
                        this.balances.set(balance.token.name, balance.amount)
                    })
                }
            } else {
                await eos.detectWallet()
            }
        } catch (error) {
            this.uiStore.showModal(ModalOptions.walletUndetected)
            return error
        }
    }

    @task.resolved logOut = async () => {
        await eos.logout()
        this.clearAuth()
    }
}

export const getAuthStore = getOrCreateStore('authStore', Auth)
