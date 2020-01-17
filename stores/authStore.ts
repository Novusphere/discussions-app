import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, autorun, computed, observable, reaction } from 'mobx'
import { persist } from 'mobx-persist'
import { ModalOptions, SignInMethods } from '@globals'
import { CreateForm } from '@components'
import { task } from 'mobx-task'
import { discussions, eos, init, nsdb } from '@novuspherejs'
import { getUiStore, IStores } from '@stores/index'
import { bkToStatusJson, sleep } from '@utils'
import { ApiGetUnifiedId } from '../interfaces/ApiGet-UnifiedId'

export default class AuthStore extends BaseStore {
    @persist('object')
    @observable
    displayName = {
        bk: null,
        scatter: null,
    }

    @persist @observable postPriv = ''
    @persist @observable uidWalletPubKey = ''
    @persist @observable preferredSignInMethod = SignInMethods.brainKey

    // private stuff
    @observable privateKey = ''

    @persist('object')
    @observable
    statusJson = {
        bk: null,
        scatter: null,
    }

    @observable clickedSignInMethod = ''

    // login objects
    @observable signInObject = {
        ref: null,
        step: 1,
    }

    // status
    @observable hasAccount = false
    @observable hasScatterAccount = false

    // wallet
    balances = observable.map<string, string>()
    @observable supportedTokensForUnifiedWallet = []
    @observable selectedToken = null

    private readonly uiStore: IStores['uiStore'] = getUiStore()

    constructor() {
        super()

        autorun(() => {
            if (this.uidWalletPubKey && this.selectedToken) {
                this.fetchBalanceForSelectedToken()
            }
        })

        nsdb.getSupportedTokensForUnifiedWallet().then(async data => {
            this.setDepositTokenOptions(data)
            this.refreshAllBalances()
        })
    }

    @task.resolved
    @action.bound
    async refreshAllBalances() {
        try {
            await sleep(250)
            await this.supportedTokensForUnifiedWallet.map(async datum => {
                await sleep(250)
                await this.fetchBalanceForSelectedToken(datum)
            })
        } catch (error) {
            throw error
        }
    }

    @action.bound
    setDepositTokenOptions(depositTokens: ApiGetUnifiedId) {
        this.supportedTokensForUnifiedWallet = depositTokens.map(token => ({
            label: token.symbol,
            value: token.contract,
            contract: token.p2k.contract,
            chain: token.p2k.chain,
            decimals: token.precision,
            fee: token.fee,
        }))

        this.selectedToken = this.supportedTokensForUnifiedWallet[0]
    }

    @task
    @action.bound
    async fetchBalanceForSelectedToken(token = this.selectedToken) {
        try {
            let symbol, chain, contract

            if (!token.hasOwnProperty('symbol')) {
                symbol = token.label
                chain = token.chain
                contract = token.contract
            } else {
                symbol = token.symbol
                chain = token.p2k.chain
                contract = token.p2k.contract
            }

            let balance = await eos.getBalance(this.uidWalletPubKey, chain, contract)

            if (!balance.length) {
                return
            }

            this.balances.set(symbol, balance[0].amount)
        } catch (error) {
            return error
        }
    }

    @task.resolved
    @action.bound
    async connectScatterWallet() {
        try {
            const wallet = await this.initializeScatterLogin()

            if (wallet.connected) {
                ;(wallet as any).connect()
                this.hasScatterAccount = true
                this.displayName.scatter = wallet.auth.accountName
            }
        } catch (error) {
            throw error
        }
    }

    @task.resolved
    @action.bound
    async disconnectScatterWallet() {
        try {
            await eos.logout()
            this.hasScatterAccount = false
            this.displayName.scatter = null
            this.uiStore.showToast('You have disconnected your scatter wallet!', 'success')
        } catch (error) {
            throw error
        }
    }

    @task
    @action.bound
    async checkInitialConditions() {
        await sleep(100)

        if (this.activeDisplayName && this.postPriv) {
            if (this.statusJson.bk && this.postPriv && this.displayName.bk) {
                this.hasAccount = true
                this.connectScatterWallet()
            }
        } else {
            this.hasAccount = false
        }
    }

    @computed get isBKAccount() {
        return this.activeDisplayName === this.displayName.bk
    }

    @computed get activePublicKey() {
        if (!this.hasAccount) return null

        if (this.statusJson.bk) {
            return this.statusJson.bk.post
        }

        if (this.statusJson.scatter) {
            return this.statusJson.scatter.post
        }

        return null
    }

    @computed get activeUidWalletKey() {
        if (!this.activePublicKey) return null
        return this.uidWalletPubKey
    }

    @computed get activePrivateKey() {
        if (!this.hasAccount) return null
        if (!this.statusJson.bk && !this.statusJson.scatter) return null

        return this.postPriv
    }

    @action.bound
    setClickedSignInMethod(method: string) {
        this.clickedSignInMethod = method
    }

    /**
     * Used for posting, returns empty string if the
     * user is logged in via a non-scatter method
     */
    @computed get posterName(): string {
        return this.activeDisplayName
    }

    // return bk or scatter
    @computed get posterType(): string {
        const posterName = this.posterName

        if (posterName === this.displayName.bk) return 'bk'
        return 'scatter'
    }

    @computed get activeDisplayName() {
        if (this.statusJson.bk) {
            return this.displayName.bk
        }

        if (this.statusJson.scatter) {
            return this.displayName.scatter
        }

        return null
    }

    @computed get hasBKAccount() {
        if (!this.displayName.bk) return false
        return this.displayName.bk
    }

    @action.bound
    setPreferredSignInMethod(method: string) {
        if (method !== this.preferredSignInMethod) {
            this.preferredSignInMethod = method
        } else {
            if (method === SignInMethods.brainKey) {
                this.preferredSignInMethod = SignInMethods.scatter
            }
            if (method === SignInMethods.scatter) {
                this.preferredSignInMethod = SignInMethods.brainKey
            }
        }
    }

    @task.resolved
    @action.bound
    async logOut() {
        try {
            this.hasAccount = false
            this.uiStore.showToast('You have logged out!', 'success')
        } catch (error) {
            throw error
        }
    }

    @task.resolved
    @action.bound
    async signUpWithBK(
        brianKeyVerify,
        displayName,
        password
    ): Promise<{ json: string; transaction: string }> {
        try {
            const auth = await this.parseAndReturnsAuthInfo(brianKeyVerify, displayName, password)
            this.uiStore.hideModal()
            this.uiStore.showToast('You have successfully signed up!', 'success')
            this.hasAccount = true
            return auth
        } catch (error) {
            this.uiStore.showToast(error.message, 'error')
            console.error(error)
            return error
        }
    }

    /**
     * Sign in forms
     */
    get setNewBKAndPasswordForm() {
        return new CreateForm(
            {
                onSubmit: form => {
                    const { bk, displayName, password } = form.values()

                    if (!form.hasError) {
                        this.loginWithBK(bk, displayName, password)
                    }
                },
            },
            [
                {
                    name: 'bk',
                    label: 'Brain Key',
                    type: 'textarea',
                    placeholder: 'Enter your BK',
                    rules: 'required|string',
                },
                {
                    name: 'displayName',
                    label: 'Display Name',
                    type: 'text',
                    placeholder: 'Enter your preferred display name',
                    rules: 'required|string',
                },
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

    @computed get setPasswordBK() {
        return new CreateForm(
            {
                onSubmit: form => {
                    const { password } = form.values()
                    if (!form.hasError) {
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

    get setPasswordScatter() {
        return new CreateForm(
            {
                onSubmit: form => {
                    const { password } = form.values()

                    if (!form.hasError) {
                        return this.loginWithScatter(password)
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

    get choosePassword() {
        return new CreateForm(
            {
                onSubmit: async form => {
                    const { password } = form.values()
                    console.log('Class: NewAuth, Function: onSubmit, Line 264 password: ', password)
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

    @task.resolved
    @action.bound
    async loginWithBK(
        bk: string,
        displayName: string,
        password: string,
        opts?: {
            hideSuccessModal: boolean
        }
    ) {
        try {
            // check if valid bk
            const bkIsValid = discussions.bkIsValid(bk)

            if (!bkIsValid) {
                this.uiStore.showToast('You have entered an invalid brain key.', 'error')
                return
            }

            const unparsedJSON = await bkToStatusJson(bk, displayName, password, null)

            console.log(
                'Class: NewAuth, Function: loginWithBK, Line 363 unparsedJSON: ',
                unparsedJSON
            )

            if (unparsedJSON) {
                const statusJSON = JSON.parse(unparsedJSON)
                this.statusJson.bk = statusJSON
                this.displayName.bk = statusJSON['displayName']

                await this.storeKeys(bk)

                this.completeSignInProcess()

                if (!opts || !opts.hideSuccessModal) {
                    this.uiStore.showToast('You have successfully signed in!', 'success')
                }
            } else {
                console.log('failed')
            }
        } catch (error) {
            this.uiStore.showToast('Something went wrong!', 'error')
            return error
        }
    }

    @task.resolved
    @action.bound
    async loginWithPassword(password: string) {
        try {
            const bk = await discussions.bkFromStatusJson(
                JSON.stringify(this.statusJson.bk),
                password
            )

            await this.loginWithBK(bk, this.statusJson.bk['displayName'], password)
        } catch (error) {
            this.uiStore.showToast(error.message, 'error')
            return error
        }
    }

    @task.resolved
    @action.bound
    async initializeScatterLogin(): Promise<Scatter.RootObject> {
        try {
            await init()
            const wallet = await eos.detectWallet()

            if (typeof wallet !== 'boolean' && wallet) {
                // prompt login
                await eos.login()
                return wallet as any
            } else {
                throw new Error('Failed to detect EOS wallet')
            }
        } catch (error) {
            this.uiStore.showToast('Failed to detect EOS wallet', 'error')
            console.log(error)
            return error
        }
    }

    @task.resolved
    @action.bound
    async loginWithScatter(password: string) {
        try {
            const accountName = eos.accountName
            const json = await discussions.bkRetrieveStatusEOS(accountName)
            const bk = await discussions.bkFromStatusJson(json, password)

            // await this.storeKeys(bk)

            if (!bk) {
                return
            }

            this.statusJson.scatter = JSON.parse(json)
            this.displayName.scatter = accountName

            if (accountName) {
                this.completeSignInProcess()
            } else {
                throw new Error('Failed to get account name')
            }
        } catch (error) {
            this.uiStore.showToast(error.message, 'error')
            return error
        }
    }

    @task.resolved
    @action.bound
    async handleStepSwitchForBK() {
        if (this.hasBKAccount) {
            // push them to password
            this.signInObject.ref.goToStep(3)
            console.log('handleStepSwitchForBK clicked, has bk account')
        } else {
            // let them setup a new bk
            this.signInObject.ref.goToStep(2)
            console.log('handleStepSwitchForBK clicked, does not have BK account')
        }
    }

    @action.bound
    private completeSignInProcess() {
        this.hasAccount = true

        if (this.signInObject.ref) {
            this.signInObject.ref.goToStep(1)
        }

        if (this.uiStore.activeModal) {
            this.uiStore.hideModal()
        }
    }

    @task.resolved
    private async parseAndReturnsAuthInfo(brianKeyVerify, displayName, password) {
        try {
            const json = await bkToStatusJson(brianKeyVerify, displayName, password, null)
            const transaction = await discussions.bkUpdateStatusEOS(json)
            await this.storeKeys(brianKeyVerify)

            return {
                json,
                transaction,
            }
        } catch (error) {}
    }

    @task.resolved
    @action.bound
    private async storeKeys(bk: string) {
        try {
            const keys = await discussions.bkToKeys(bk)
            this.postPriv = keys.post.priv
            this.uidWalletPubKey = keys.uidwallet.pub
            return keys
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}

export const getAuthStore = getOrCreateStore('authStore', AuthStore)
