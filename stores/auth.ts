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
                    this.checkInitialConditions()
                }
            }
        )
    }

    /**
     * Check the condition of LS to determine if the user should be logged in or not
     */
    @task
    @action.bound
    async checkInitialConditions() {
        if (this.preferredSignInMethod === SignInMethods.scatter) {
            const statusJson = await discussions.bkRetrieveStatusEOS(this.accountName)

            if (statusJson) {
                const parsedJSON = JSON.parse(statusJson)
                if (parsedJSON.tip !== this.tipPub) {
                    this.uiStore.showModal(ModalOptions.signIn)
                    await sleep(200)
                    this.signInObjectState(4)
                } else {
                    await init()
                    const wallet = await eos.detectWallet()

                    if (typeof wallet !== 'boolean' && wallet) {
                        await this.initializeScatterAndSetBalance()
                        this.isLoggedIn = true
                    }
                }
            }
        } else if (this.preferredSignInMethod === SignInMethods.brainKey) {
            if (this.postPriv && this.tipPub && this.accountName) {
                this.isLoggedIn = true
            }
        }
    }

    /**
     * Signup forms
     */
    get setAccountAndPassword() {
        return new CreateForm(
            {
                onSubmit: form => {
                    const { displayName, password } = form.values()
                    if (displayName && password) {
                        this.anonymousObject.username = displayName
                        this.anonymousObject.password = password
                    }
                },
            },
            [
                {
                    name: 'posterName',
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
                    if (bkVerify) {
                        this.anonymousObject.bkVerify = bkVerify
                    }
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
                onSubmit: async form => {
                    const { password } = form.values()
                    if (password) {
                        this.signInObject.password = password
                        try {
                            await this.setupBKKeysToScatter()
                            await this.signUpSuccess()
                        } catch (error) {
                            console.error(error)
                        }
                    }
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
                    if (password) {
                        this.loginWithPassword(password)
                    }
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

    get DEPRECATED_signInForm() {
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
                    rules: 'required|string',
                },
            ]
        )
    }

    @computed get ATMOSBalance(): number {
        return this.balances.get('ATMOS') || 0
    }

    /**
     * Used for posting, returns empty string if the
     * user is logged in via a non-scatter method
     */
    @computed get posterName(): string {
        if (this.preferredSignInMethod === SignInMethods.brainKey) {
            return ''
        }

        return this.accountName
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
            const parsed = JSON.parse(this.statusJson)

            // set account name just in case things changed
            this.accountName = parsed.displayName

            await this.storeKeys(bk)
            await this.signUpSuccess()
        } catch (error) {
            console.error('Login failed!', error)
            this.uiStore.showToast(error.message, 'error')

            if (error.message === 'No brian key found') {
                await this.generateBrianKey()
                this.signInObjectState(2)
            }
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

    @task.resolved storeKeys = async (bk: string) => {
        try {
            const keys = await discussions.bkToKeys(bk)
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
                let statusJson = await this.bkToStatusJson(
                    brainKey,
                    anonymousObject.username,
                    anonymousObject.password,
                    null
                )

                if (statusJson === 'test') {
                    statusJson = undefined
                }

                console.log('statusJson: ', statusJson)

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
        this.accountName = ''
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
