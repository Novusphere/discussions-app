import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, computed, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { CreateForm } from '@components'
import { task } from 'mobx-task'
import axios from 'axios'
import { getAuthStore, getUiStore, IStores } from '@stores/index'
import { checkIfNameIsValid, sleep } from '@utils'
import { discussions, eos, nsdb } from '@novuspherejs'
import { ApiGetUnifiedId } from 'interfaces/ApiGet-UnifiedId'
import ecc from 'eosjs-ecc'
import { ModalOptions } from '@globals'

const fileDownload = require('js-file-download')

export type BlockedContentSetting = 'hidden' | 'collapsed'

export default class SettingsStore extends BaseStore {
    @persist @observable localStorageVersion = '2.0.0'

    @persist
    @observable
    blockedContentSetting: BlockedContentSetting = 'hidden'

    @persist
    @observable
    unsignedPostsIsSpam = true

    @observable tokens = []
    @observable supportedTokensForUnifiedWallet = []
    @observable thresholdTxID = ''
    @observable errorMessage = ''

    // loading states
    @observable loadingStates = {
        transferring: false,
        withdrawing: false,
    }

    private readonly authStore: IStores['authStore'] = getAuthStore()
    private readonly uiStore: IStores['uiStore'] = getUiStore()

    constructor() {
        super()

        nsdb.getSupportedTokensForUnifiedWallet().then(data => {
            this.setDepositTokenOptions(data)
        })
    }

    @action.bound
    setUnsignedPostsAsSpamSetting(setting: boolean) {
        this.unsignedPostsIsSpam = setting
    }

    @action.bound
    setBlockedContentSetting(type: BlockedContentSetting) {
        this.blockedContentSetting = type
    }

    @computed get blockedSettingForm() {
        return new CreateForm({}, [
            {
                name: 'hidden',
                label: 'Hidden',
                type: 'switch',
                description: 'Hide blocked content entirely including all replies.',
                value: this.blockedContentSetting === 'hidden',
                onChange: value => {
                    if (value) this.setBlockedContentSetting('hidden')
                    else this.setBlockedContentSetting('collapsed')
                },
            },
            {
                name: 'collapsed',
                label: 'Collapse',
                type: 'switch',
                description:
                    'Auto-Collapse all blocked content, with the ability to expand the post.',
                value: this.blockedContentSetting === 'collapsed',
                onChange: value => {
                    if (value) this.setBlockedContentSetting('collapsed')
                    else this.setBlockedContentSetting('hidden')
                },
            },
            {
                name: 'unsignedPosts',
                label: 'Hide Unsigned Posts',
                type: 'switch',
                description: 'If a post has no signature hide it with the above settings.',
                value: this.unsignedPostsIsSpam,
                onChange: value => this.setUnsignedPostsAsSpamSetting(value),
            },
        ])
    }

    @action.bound
    setTokens(tokens: any) {
        this.tokens = tokens.map(q => {
            return {
                label: `${q.name} (${q.account})`,
                name: q.name,
                value: q.account,
                symbol: q.symbol,
            }
        })
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
    }

    @computed get recipients() {
        if (!this.airdropForm.form.$('accountNames').value) return []
        return this.airdropForm.form.$('accountNames').value.match(/[^\,\;\n\s]+/gi)
    }

    @computed get recipientCount() {
        return this.recipients.length
    }

    @task.resolved
    @action.bound
    async getValues(form: any) {
        if (form.hasError) return

        const values = form.values()
        values.accountNames = this.recipients

        // validate account names
        const invalidNames = []

        await values.accountNames.map(async accountName => {
            await sleep(100)
            const isValidAccountName = await checkIfNameIsValid(accountName)
            if (!isValidAccountName) invalidNames.push(accountName)
        })

        await sleep(100 * this.recipientCount)

        if (invalidNames.length) {
            form.$('accountNames').invalidate(
                `The names: ${invalidNames.join(
                    ','
                )} are invalid. Ensure you are entering valid EOS usernames.`
            )

            return
        }

        await sleep(500)

        const precision = await eos.getTokenPrecision(values.token.value, values.token.name)
        const amount: string = values.amount

        values.amount = Number(amount).toFixed(precision)
        values.actor = this.authStore.activeDisplayName

        return values
    }

    @task.resolved
    @action.bound
    async handleDownloadAirDropSubmit(form) {
        const values = await this.getValues(form)

        if (values) {
            try {
                const { data } = await axios.get('/api/writeFile', {
                    params: values,
                })

                fileDownload(JSON.stringify(data), 'airdrop.json')
            } catch (error) {
                return error
            }
        }
    }

    @task.resolved
    @action.bound
    async handleAirDropSubmit(form) {
        try {
            const values = await this.getValues(form)
            const actions = []

            // logout user
            // https://github.com/Novusphere/discussions-app/issues/102
            await eos.logout()

            // scatter detection
            await eos.detectWallet()
            await eos.login()

            if (typeof eos.auth !== 'undefined') {
                this.recipients.map(async recipient => {
                    actions.push({
                        account: values.token.value,
                        name: 'transfer',
                        data: {
                            from: eos.auth.accountName,
                            to: recipient,
                            quantity: `${values.amount} ${values.token.symbol}`,
                            memo: values.memoId,
                        },
                    })
                })

                this.thresholdTxID = await eos.transact(actions)
            } else {
                this.uiStore.showToast('Failed to detect Scatter', 'error')
            }
        } catch (error) {
            this.errorMessage = error.message
            return error
        }
    }

    @computed get airdropForm() {
        return new CreateForm({}, [
            {
                name: 'accountNames',
                label: 'Account Names',
                type: 'textarea',
                description:
                    'Enter alphanumeric account names (that can also contain a period) followed by a comma, a space or a line break.',
                rules: 'required|string',
            },
            {
                name: 'token',
                label: 'Token',
                type: 'dropdown',
                extra: {
                    options: this.tokens || [],
                },
                rules: 'required',
            },
            {
                name: 'amount',
                label: 'Amount',
                rules: 'required|numeric',
            },
            {
                name: 'memoId',
                label: 'Memo ID',
                rules: 'required',
            },
            {
                name: 'buttons',
                type: 'button',
                hideLabels: true,
                containerClassName: 'flex flex-row items-center justify-end',
                extra: {
                    options: [
                        {
                            value: 'Download Airdrop',
                            className: 'white bg-green',
                            title: 'Download Airdrop',
                            onClick: this.handleDownloadAirDropSubmit,
                        },
                        {
                            value: 'Airdrop',
                            className: 'white bg-green',
                            title: 'AirDrop',
                            onClick: this.handleAirDropSubmit,
                        },
                    ],
                },
            },
        ])
    }

    @task.resolved
    @action.bound
    async handleDepositSubmit() {
        try {
            const { form } = this.depositsForm
            const { amount, memoId, token } = form.values()
            const { label, value, contract, decimals, chain } = token

            const transaction = {
                account: value,
                name: 'transfer',
                data: {
                    from: this.authStore.displayName.scatter,
                    to: contract,
                    quantity: `${Number(amount).toFixed(decimals)} ${label}`,
                    memo: memoId,
                },
            }

            console.log('submitting transaction: ', transaction)
            const resp = await eos.transact(transaction)
            console.log(resp)
            this.uiStore.showToast('Deposit successfully submitted!', 'success')
        } catch (error) {
            this.uiStore.showToast('Deposit failed to submit', 'error')
            throw error
        }
    }

    @computed get depositsForm() {
        return new CreateForm({}, [
            {
                name: 'token',
                label: 'Token',
                type: 'dropdown',
                extra: {
                    options: this.supportedTokensForUnifiedWallet || [],
                },
                rules: 'required',
            },
            {
                name: 'amount',
                label: 'Amount',
                rules: 'required|numeric',
            },
            {
                name: 'memoId',
                label: 'Memo ID',
                rules: 'required',
                disabled: true,
                value: this.authStore.uidWalletPubKey,
            },
            {
                name: 'buttons',
                type: 'button',
                hideLabels: true,
                containerClassName: 'flex flex-row items-center justify-end',
                extra: {
                    options: [
                        {
                            value: 'Submit Deposit',
                            className: 'white bg-green',
                            title: 'Submit Deposit',
                            onClick: this.handleDepositSubmit,
                        },
                    ],
                },
            },
        ])
    }

    @action.bound
    private async getSignatureAndSubmit(robj, fromAddress) {
        try {
            robj.sig = eos.transactionSignature(
                robj.chain,
                fromAddress,
                robj.to,
                robj.amount,
                robj.fee,
                robj.nonce,
                robj.memo
            )

            const { data } = await axios.post(
                'https://atmosdb.novusphere.io/unifiedid/relay',
                `data=${encodeURIComponent(JSON.stringify(robj))}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            )

            return data
        } catch (error) {
            throw error
        }
    }

    @task.resolved
    @action.bound
    async handleWithdrawalSubmit(walletPrivateKey: string) {
        const { form } = this.withdrawalForm
        const { amount, token, to, memo } = form.values()

        if (!token) return

        const {
            label,
            value,
            contract,
            decimals,
            chain,
            fee: { flat, percent },
        } = token

        const amountasNumber = Number(amount)
        const fee = amountasNumber * percent + flat

        try {
            const robj = {
                chain: parseInt(String(chain)),
                from: ecc.privateToPublic(walletPrivateKey),
                to: 'EOS1111111111111111111111111111111114T1Anm', // special withdraw address
                amount: `${Number(amount).toFixed(decimals)} ${label}`,
                fee: `${Number(fee).toFixed(decimals)} ${label}`,
                nonce: new Date().getTime(),
                memo: `${to}:${memo}`,
                sig: '',
            }

            const data = await this.getSignatureAndSubmit(robj, walletPrivateKey)

            if (data.error) {
                this.uiStore.showToast('Withdrawal failed to submit', 'error')
                return
            }

            await this.authStore.fetchBalancesForCurrentWallet()

            this.uiStore.showToast('Withdrawal successfully submitted!', 'success')
            ;(form as any).clear()
            this.loadingStates.withdrawing = false
        } catch (error) {
            this.loadingStates.withdrawing = false
            this.uiStore.showToast('Withdrawal failed to submit', 'error')
            throw error
        }
    }

    @computed get withdrawalForm() {
        return new CreateForm(
            {
                onSubmit: form => {
                    if (form.isValid) {
                        this.loadingStates.withdrawing = true
                        this.showPasswordEntryModal()
                    }
                },
            },
            [
                {
                    name: 'amount',
                    label: 'Amount',
                    rules: 'required',
                },
                {
                    name: 'token',
                    label: 'Token',
                    type: 'dropdown',
                    extra: {
                        options: this.supportedTokensForUnifiedWallet || [],
                    },
                    rules: 'required',
                },
                {
                    name: 'to',
                    label: 'To',
                    rules: 'required',
                    value: eos.auth ? eos.auth.accountName : '',
                    placeholder: 'An EOS account name',
                },
                {
                    name: 'memo',
                    label: 'Memo',
                    rules: 'required',
                },
                {
                    name: 'buttons',
                    type: 'button',
                    hideLabels: true,
                    containerClassName: 'flex flex-row items-center justify-end',
                    extra: {
                        options: [
                            {
                                value: 'Submit Withdrawal',
                                className: 'white bg-green',
                                title: 'Submit Withdrawal',
                            },
                        ],
                    },
                },
            ]
        )
    }

    @computed get passwordReEntryForm() {
        return new CreateForm(
            {
                onSubmit: async form => {
                    const { password } = form.values()

                    // un-encrypt their bk
                    const {
                        statusJson: {
                            bk: { bk, bkc },
                        },
                    } = this.authStore

                    try {
                        const walletPrivateKey = await discussions.encryptedBKToKeys(
                            bk,
                            bkc,
                            password
                        )

                        console.log('got wallet private key!', walletPrivateKey)

                        this.uiStore.hideModal()

                        if (this.loadingStates.withdrawing) {
                            this.handleWithdrawalSubmit(walletPrivateKey)
                        }

                        if (this.loadingStates.transferring) {
                            this.handleTransferSubmit(walletPrivateKey)
                        }
                    } catch (error) {
                        form.$('password').invalidate(error.message)
                        return error
                    }
                },
            },
            [
                {
                    name: 'password',
                    label: 'Password',
                    rules: 'required',
                    type: 'password',
                },
            ]
        )
    }

    @action.bound
    async showPasswordEntryModal() {
        this.uiStore.showModal(ModalOptions.walletActionPasswordReentry)
    }

    @task.resolved
    @action.bound
    async handleTransferSubmit(walletPrivateKey: string) {
        const { form } = this.transferForm
        const { amount, token, to, memo } = form.values()

        if (!token) return

        const {
            label,
            value,
            contract,
            decimals,
            chain,
            fee: { flat, percent },
        } = token

        const amountasNumber = Number(amount)
        const fee = amountasNumber * percent + flat

        try {
            const robj = {
                chain: parseInt(String(chain)),
                from: ecc.privateToPublic(walletPrivateKey),
                to: to,
                amount: `${Number(amount).toFixed(decimals)} ${label}`,
                fee: `${Number(fee).toFixed(decimals)} ${label}`,
                nonce: new Date().getTime(),
                memo: memo,
                sig: '',
            }

            const data = await this.getSignatureAndSubmit(robj, walletPrivateKey)

            if (data.error) {
                this.uiStore.showToast('Transfer failed to submit', 'error')
                return
            }

            await this.authStore.fetchBalancesForCurrentWallet()

            this.uiStore.showToast('Transfer successfully submitted!', 'success')
            ;(form as any).clear()
            this.loadingStates.transferring = false
        } catch (error) {
            this.loadingStates.transferring = false
            this.uiStore.showToast('Transfer failed to submit', 'error')
            throw error
        }
    }

    @computed get transferForm() {
        return new CreateForm(
            {
                onSubmit: form => {
                    if (form.isValid) {
                        this.loadingStates.transferring = true
                        this.showPasswordEntryModal()
                    }
                },
            },
            [
                {
                    name: 'amount',
                    label: 'Amount',
                    rules: 'required',
                },
                {
                    name: 'token',
                    label: 'Token',
                    type: 'dropdown',
                    extra: {
                        options: this.supportedTokensForUnifiedWallet || [],
                    },
                    rules: 'required',
                },
                {
                    name: 'to',
                    label: 'To',
                    rules: 'required',
                    placeholder: 'An EOS address',
                },
                {
                    name: 'memo',
                    label: 'Memo',
                    rules: 'required',
                },
                {
                    name: 'buttons',
                    type: 'button',
                    hideLabels: true,
                    containerClassName: 'flex flex-row items-center justify-end',
                    extra: {
                        options: [
                            {
                                value: 'Submit Transfer',
                                className: 'white bg-green',
                                title: 'Submit Transfer',
                            },
                        ],
                    },
                },
            ]
        )
    }
}

export const getSettingsStore = getOrCreateStore('settingsStore', SettingsStore)
