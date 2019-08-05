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

interface anonSignInObject {
    username: string
    password: string
    bk: string
    bkVerify: string
}

export default class Auth extends BaseStore {
    static CurrentDefaultStep = 1

    @persist @observable accountName = ''
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
                    placeholder: 'Your display name',
                    rules: 'required|string|between:3,25',
                },
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

    @computed get isLoggedIn(): boolean {
        return this.accountName !== '' && this.permission !== '' && this.publicKey !== ''
    }

    @computed get ATMOSBalance(): number {
        return this.balances.get('ATMOS') || 0
    }

    public signUpObjectState = (stepNumber: number) => {
        this.signUpObject.currentStep = stepNumber
        this.signUpObject.instance.setActiveStep(stepNumber - 1)
    }

    public signUpObject_nextStep = () => {
        this.signUpObjectState(this.signUpObject.currentStep + 1)
    }

    public signUpObject_prevStep = () => {
        this.signUpObjectState(this.signUpObject.currentStep - 1)
    }

    @task.resolved loginWithPassword = async (password: string): Promise<void> => {
        try {
            console.log('Logging in with password')
            await sleep(3000)
            const bk = await discussions.bkFromStatusJson(this.statusJson, password)
            await this.storeKeys(bk)
            this.uiStore.hideModal()
            console.log('Login success! Keys stored in LS!')
        } catch (error) {
            console.log('Login failed!')
            console.log(error)
            this.uiStore.showToast(error.message, 'error')
            return error
        }
    }

    @task.resolved setupBKKeysToScatter = async (): Promise<string | Error> => {
        try {
            this.signUpObject.username = this.accountName
            const json = await this.bkToStatusJson(
                this.brianKey,
                this.signUpObject.username,
                this.signUpObject.password,
                null
            )
            return await discussions.bkUpdateStatusEOS(json)
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

    @task.resolved signInViaWallet = async (): Promise<any> => {
        try {
            this.preferredSignInMethod = SignInMethods.scatter
            await init()
            const wallet = await eos.detectWallet()

            if (typeof wallet !== 'boolean' && wallet) {
                await this.logInAndInitializeAccount()
                const statusJson = await discussions.bkRetrieveStatusEOS(this.accountName)

                this.statusJson = statusJson

                if (typeof statusJson === 'undefined') {
                    this.signUpObjectState(2)
                    await this.generateBrianKey()
                }

                if (statusJson) {
                    this.signUpObjectState(4)
                }
            } else {
                this.uiStore.showToast('Failed to detect wallet', 'error')
            }
        } catch (error) {
            this.uiStore.showToast('Failed to detect wallet', 'error')
            console.log(error)
        }
    }

    @task.resolved signInWithBrainKey = async (): Promise<any> => {
        try {
            await sleep(1000)
            console.log('Going to step 4: enter password!')
            this.signUpObjectState(4)
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
                const statusEOS = await discussions.bkRetrieveStatusEOS(anonymousObject.username)
                const brainKey = generateBrianKey['result']

                if (!statusEOS) {
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

                    this.uiStore.hideModal()
                    this.uiStore.showToast(
                        'Successfully signed up! You are now logged in!',
                        'success'
                    )
                }
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
