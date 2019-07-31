import { action, computed, observable, reaction } from 'mobx'
import { task } from 'mobx-task'
import { eos, discussions, init } from '@novuspherejs'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { getUiStore } from '@stores/ui'
import { IStores } from '@stores'
import { ModalOptions, SignInMethods } from '@globals'
import { sleep } from '@utils'
import CreateForm from '../components/create-form/create-form'
import { persist } from 'mobx-persist'

export default class Auth extends BaseStore {
    @observable accountName = ''
    @observable permission = ''
    @observable publicKey = ''
    @observable balances = observable.map<string, number>()

    @observable brianKey = ''

    @persist @observable preferredSignInMethod = ''
    @persist @observable postPriv = ''
    @persist @observable tipPub = ''

    private uiStore: IStores['uiStore'] = getUiStore()

    constructor() {
        super()

        const showModalReaction = reaction(
            () => this.isLoggedIn,
            status => {
                if (!status) {
                    // this.uiStore.showModal(ModalOptions.signUp)
                }
            },
            {
                fireImmediately: true,
            }
        )

        showModalReaction()
    }

    get signInForm() {
        return new CreateForm(
            {
                onSuccess: form => {
                    console.log(form.values())
                },
            },
            [
                {
                    name: 'email',
                    label: 'Email',
                    placeholder: 'Your email address',
                    rules: 'required|email',
                },
                {
                    name: 'password',
                    label: 'Password',
                    placeholder: 'Your password',
                    rules: 'required|password',
                },
            ]
        )
    }

    get choosePassword() {
        return new CreateForm(
            {
                onSubmit: form => {
                    console.log(form.values())
                },
            },
            [
                {
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    placeholder: 'Your password',
                    rules: 'required|string|between:5,25',
                },
                {
                    name: 'passwordConfirm',
                    label: 'Password Confirmation',
                    type: 'password',
                    placeholder: 'Confirm Password',
                    rules: 'required|string|same:password',
                },
            ]
        )
    }

    /**
     * @return {boolean} True if bk is set, undefined if it is not set, false if the wallet failed to be set
     */
    @task.resolved signInViaWallet = async (): Promise<boolean | undefined> => {
        try {
            this.preferredSignInMethod = SignInMethods.scatter

            await init()
            const wallet = await eos.detectWallet()
            if (typeof wallet !== 'boolean' && wallet) {
                await this.logInAndInitializeAccount()

                const status = await discussions.bkRetrieveStatusEOS(this.accountName)
                console.log(status)

                return !!status
            }

            return false
        } catch (error) {
            console.log(error)
        }
    }

    @task.resolved signInWithBrianKey = async () => {
        try {
            const keys = await discussions.bkToKeys(this.brianKey)
            this.postPriv = keys.post.priv
            this.tipPub = keys.tip.pub
            return keys
        } catch (error) {
            console.log(error)
        }
    }

    @computed get isLoggedIn(): boolean {
        return this.accountName !== '' && this.permission !== '' && this.publicKey !== ''
    }

    @computed get ATMOSBalance(): number {
        return this.balances.get('ATMOS') || 0
    }

    @action setPreferredSignInMethod = (method: string) => {
        this.preferredSignInMethod = method
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

    @task.resolved logInAndInitializeAccount = async () => {
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
        const key = discussions.bkCreate()
        this.brianKey = key
        return key
    }
}

export const getAuthStore = getOrCreateStore('authStore', Auth)
