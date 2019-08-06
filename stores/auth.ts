import { action, computed, observable, reaction, when } from 'mobx'
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

interface anonSignInObject {
    username: string
    password: string
    bk: string
    bkVerify: string
}

export default class Auth extends BaseStore {
    static CurrentDefaultStep = 1

    @observable isLoggedIn = false

    @persist @observable accountName = ''
    @observable permission = ''
    @observable publicKey = ''
    @observable balances = observable.map<string, number>()

    @observable brianKey = ''

    @persist @observable preferredSignInMethod = ''
    @persist @observable postPriv = ''
    @persist @observable tipPub = ''

    @observable.deep signInObject: signUpObject = {
        currentStep: Auth.CurrentDefaultStep,
        instance: null, // step instance
        username: '',
        password: '',
    }

    @observable.deep anonymousObject: anonSignInObject = {
        username: '',
        password: '',
        bk: '',
        bkVerify: '',
    }

    @persist @observable statusJson: string

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

        when(
            () => !!this.statusJson,
            async () => {
                if (!this.isLoggedIn) {
                    this.uiStore.showModal(ModalOptions.signIn)
                    await sleep(50)
                    this.signInObject.currentStep = 4
                }
            }
        )
    }

    /**
     * Signup forms
     */
    get setAccountAndPassword() {
        return new CreateForm(
            {
                onSuccess: form => {
                    const { displayName, password } = form.values()
                    this.anonymousObject.username = displayName
                    this.anonymousObject.password = password
                },
            },
            [
                {
                    name: 'displayName',
                    label: 'Display Name',
                    type: 'text',
                    value: this.anonymousObject.username,
                    placeholder: 'Your display name',
                    rules: 'required|string|between:3,25',
                },
                {
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    value: this.anonymousObject.password,
                    placeholder: 'Your password',
                    rules: 'required|string|between:5,25',
                },
                {
                    name: 'passwordConfirm',
                    label: 'Password Confirmation',
                    type: 'password',
                    value: this.anonymousObject.password,
                    placeholder: 'Confirm Password',
                    rules: 'required|string|same:password',
                },
            ]
        )
    }

    get verifyBKForm() {
        return new CreateForm(
            {
                onSubmit: form => {
                    const { bkVerify } = form.values()
                    this.anonymousObject.bkVerify = bkVerify
                },
            },
            [
                {
                    name: 'bkVerify',
                    label: 'Verify your brain key',
                    type: 'textarea',
                    rules: 'required|string',
                },
            ]
        )
    }

    /**
     * Login forms
     */
    get choosePassword() {
        return new CreateForm(
            {
                onSuccess: async form => {
                    const { password } = form.values()
                    console.log(password)

                    this.signInObject.password = password

                    await this.setupBKKeysToScatter()
                    await this.signUpSuccess()
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
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    placeholder: 'Your password',
                    rules: 'required|string',
                },
            ]
        )
    }

    @computed get ATMOSBalance(): number {
        return this.balances.get('ATMOS') || 0
    }

    public signInObjectState = (stepNumber: number) => {
        this.signInObject.currentStep = stepNumber
        this.signInObject.instance.setActiveStep(stepNumber - 1)
    }

    public signInObject_nextStep = () => {
        this.signInObjectState(this.signInObject.currentStep + 1)
    }

    public signInObject_prevStep = () => {
        this.signInObjectState(this.signInObject.currentStep - 1)
    }

    private signUpSuccess = async () => {
        this.uiStore.hideModal()
        this.isLoggedIn = true
        console.log('Login success! Keys stored in LS!')
    }

    @task.resolved loginWithPassword = async (password: string): Promise<void> => {
        try {
            console.log('Logging in with password')
            await sleep(1000)
            const bk = await discussions.bkFromStatusJson(this.statusJson, password)
            await this.storeKeys(bk)
            await this.signUpSuccess()
        } catch (error) {
            console.log('Login failed!')
            console.log(error)
            this.uiStore.showToast(error.message, 'error')
            return error
        }
    }

    @task.resolved setupBKKeysToScatter = async (): Promise<string | Error> => {
        try {
            this.signInObject.username = this.accountName
            const json = await this.bkToStatusJson(
                this.brianKey,
                this.signInObject.username,
                this.signInObject.password,
                null
            )
            const transact = await discussions.bkUpdateStatusEOS(json)
            await this.storeKeys(this.brianKey)
            return transact
        } catch (error) {
            return error
        }
    }

    @task.resolved bkToStatusJson = async (
        bk: string,
        username: string,
        password: string,
        status: any
    ): Promise<string> => {
        try {
            return await discussions.bkToStatusJson(bk, username, password, status)
        } catch (error) {
            return error
        }
    }

    @task.resolved loginWithScatter = async (): Promise<any> => {
        try {
            this.preferredSignInMethod = SignInMethods.scatter
            await init()
            const wallet = await eos.detectWallet()

            if (typeof wallet !== 'boolean' && wallet) {
                await this.initializeScatterAndSetBalance()
                const statusJson = await discussions.bkRetrieveStatusEOS(this.accountName)
                this.statusJson = statusJson

                console.log('found statusJSON', this.statusJson)

                if (statusJson) {
                    console.log('Going to step 4, enter password')
                    this.signInObjectState(4)
                } else {
                    console.log('You gotta generate a BK!')
                    this.signInObjectState(2)
                    await this.generateBrianKey()
                }
            } else {
                this.uiStore.showToast('Failed to detect wallet', 'error')
            }
        } catch (error) {
            this.uiStore.showToast('Failed to detect wallet', 'error')
            console.log(error)
        }
    }

    @task.resolved loginWithBrainKey = async (): Promise<any> => {
        try {
            if (this.statusJson) {
                console.log('Going to step 4: enter password!')
                this.signInObjectState(4)
            } else {
                this.uiStore.showModal(ModalOptions.signUp)
                this.uiStore.showToast("You don't have an account. Create one now!", 'info')
            }
        } catch (error) {
            this.uiStore.showToast('Failed to sign in with Brain Key', 'error')
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

    @task.resolved
    public signUpAsAnonymousId = async () => {
        const { generateBrianKey, anonymousObject, storeKeys } = this

        try {
            if (generateBrianKey['result'] === anonymousObject.bkVerify) {
                await storeKeys(generateBrianKey['result'])
                const brainKey = generateBrianKey['result']
                const statusJson = await this.bkToStatusJson(
                    brainKey,
                    anonymousObject.username,
                    anonymousObject.password,
                    null
                )

                console.log('statusJson Confirmed: ', statusJson)

                this.statusJson = statusJson
                await discussions.bkUpdateStatusEOS(statusJson)
                await this.storeKeys(brainKey)

                this.accountName = anonymousObject.username
                this.signUpSuccess()
            } else {
                this.uiStore.showToast(
                    'Failed to verify your Brain Key. Ensure you are entering it correctly.',
                    'error'
                )
                console.error('bk not verified')
            }
        } catch (error) {
            this.uiStore.showToast(error.message, 'error')
            console.error(error)
            return error
        }
    }

    @action setPreferredSignInMethod = (method: string) => {
        this.preferredSignInMethod = method
    }

    @action clearAuth = () => {
        this.isLoggedIn = false
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

    @task.resolved initializeScatterAndSetBalance = async () => {
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

    @task.resolved generateBrianKey = async () => {
        await sleep(1000)
        const key = discussions.bkCreate()
        this.brianKey = key
        return key
    }
}

export const getAuthStore = getOrCreateStore('authStore', Auth)
