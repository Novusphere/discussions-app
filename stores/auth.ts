import { action, computed, observable } from 'mobx'
import { task } from 'mobx-task'
import { eos, discussions } from '@novuspherejs'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { getUiStore } from '@stores/ui'
import { IStores } from '@stores'
import { ModalOptions } from '@globals'
import { sleep } from '@utils'

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

    @task fetchSuggestedAccounts = async (
        partialName: string
    ): Promise<{ id: string; value: string }[]> => {
        try {
            const accounts = await eos.getSuggestAccounts(partialName)
            return accounts.map(account => ({
                id: account,
                value: account,
            }))
        } catch (error) {
            console.error(error)
            return error
        }
    }

    @task.resolved logIn = async () => {
        try {
            let wallet = eos.wallet

            if (typeof wallet !== 'boolean' && wallet) {
                await eos.login()
                if (eos.auth) {
                    this.setAuth(eos.auth)
                    // fetch balances
                    const balances = await eos.getAccountTokens(this.accountName)
                    balances.forEach(balance => {
                        this.balances.set(balance.token.name, balance.amount)
                    })
                }
            } else {
                const wallet = await eos.detectWallet()

                if (!wallet) {
                    this.uiStore.showModal(ModalOptions.walletUndetected)
                }
            }
        } catch (error) {
            return error
        }
    }

    @task.resolved logOut = async () => {
        await eos.logout()
        this.clearAuth()
    }

    /**
     * Login methods
     */

    @task.resolved generateBrianKey = async () => {
        await sleep(1000)
        const key =  discussions.bkCreate()
        console.log(key)
        return key
    }
}

export const getAuthStore = getOrCreateStore('authStore', Auth)
