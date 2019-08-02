import { action, computed, observable, reaction } from 'mobx'
import { task } from 'mobx-task'
import { discussions, eos, init } from '@novuspherejs'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { getUiStore } from '@stores/ui'
import { IStores } from '@stores'
import { ModalOptions, SignInMethods } from '@globals'
import { sleep } from '@utils'
import CreateForm from '../components/create-form/create-form'
import { persist } from 'mobx-persist'
import { StepProps } from '@d.ts/declarations'

interface signUpObject {
    currentStep: number
    instance: StepProps
    username: string
    password: string
}

export default class Auth extends BaseStore {
    static CurrentDefaultStep = 1

    @observable accountName = ''
    @observable permission = ''
    @observable publicKey = ''
    @observable balances = observable.map<string, number>()

    @observable brianKey = ''

    @persist @observable preferredSignInMethod = ''
    @persist @observable postPriv = ''
    @persist @observable tipPub = ''

    @observable.deep signUpObject: signUpObject = {
        currentStep: Auth.CurrentDefaultStep,
        instance: null, // step instance
        username: '',
        password: '',
    }

    // when a user logins, store statusJson result here
    @observable statusJson: string

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

    public setStepInState = (stepNumber: number) => {
        this.signUpObject.currentStep = stepNumber
        this.signUpObject.instance.setActiveStep(stepNumber - 1)
    }

    public nextStep = () => {
        this.setStepInState(this.signUpObject.currentStep + 1)
    }

    public prevStep = () => {
        this.setStepInState(this.signUpObject.currentStep - 1)
    }

    /**
     * Signup forms
     */
    get choosePassword() {
        return new CreateForm(
            {
                onSuccess: form => {
                    const { password } = form.values()
                    this.signUpObject.password = password
                    this.setupBKKeysToScatter()
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
     * Login forms
     */
    get setPassword() {
        return new CreateForm(
            {
                onSubmit: form => {
                    const { password } = form.values()
                    this.loginWithPassword(password)
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
            ]
        )
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

    @task.resolved loginWithPassword = async (password: string): Promise<void> => {
        try {
            await sleep(3000)
            const bk = await discussions.bkFromStatusJson(this.statusJson, password)
            await this.storeKeys(bk)

            console.log('keys stored!')

            this.uiStore.hideModal()
        } catch (error) {
            console.log(error)
            return error
        }
    }

    @task.resolved setupBKKeysToScatter = async (): Promise<string | Error> => {
        try {
            this.signUpObject.username = this.accountName
            const json = await this.bkToStatusJson()
            return await discussions.bkUpdateStatusEOS(json)
        } catch (error) {
            return error
        }
    }

    @task.resolved bkToStatusJson = async (): Promise<string> => {
        try {
            return await discussions.bkToStatusJson(
                this.brianKey,
                this.signUpObject.username,
                this.signUpObject.password,
                null
            )
        } catch (error) {
            return error
        }
    }

    @task.resolved signInViaWallet = async (): Promise<void> => {
        try {
            this.preferredSignInMethod = SignInMethods.scatter
            await init()
            const wallet = await eos.detectWallet()

            if (typeof wallet !== 'boolean' && wallet) {
                await this.logInAndInitializeAccount()
                const statusJson = await discussions.bkRetrieveStatusEOS(this.accountName)

                this.statusJson = statusJson

                if (typeof statusJson === 'undefined') {
                    this.setStepInState(2)
                    await this.generateBrianKey()
                }

                if (statusJson) {
                    this.setStepInState(5)
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    @task.resolved storeKeys = async (key: string) => {
        try {
            const keys = await discussions.bkToKeys(key)
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
