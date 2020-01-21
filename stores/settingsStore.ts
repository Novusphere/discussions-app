import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, autorun, computed, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { CreateForm } from '@components'
import { task } from 'mobx-task'
import axios from 'axios'
import { getAuthStore, getUiStore, IStores } from '@stores/index'
import { checkIfNameIsValid, sleep, submitRelayAsync } from '@utils'
import { discussions, eos } from '@novuspherejs'
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
    @observable thresholdTxID = ''
    @observable errorMessage = ''

    // loading states
    @observable loadingStates = {
        transferring: false,
        withdrawing: false,
    }

    @observable blurStates = {
        transferring: {
            amount: false,
            finalAmount: false,
        },
        withdrawing: {
            amount: false,
            finalAmount: false,
        },
    }

    private readonly authStore: IStores['authStore'] = getAuthStore()
    private readonly uiStore: IStores['uiStore'] = getUiStore()

    constructor() {
        super()

        autorun(() => {
            if (!this.authStore.selectedToken) return

            const setFormInputsForFeesAndAmounts = (
                { form },
                initial = 'amount',
                final = 'finalAmount'
            ) => {
                const {
                    fee: { percent, flat },
                    decimals,
                } = this.authStore.selectedToken

                let formValue = form.$(initial).value
                let _value = Number(formValue)

                if (isNaN(_value)) {
                    _value = 0
                }

                const fee = _value * percent + flat
                form.$('fee').set('value', fee.toFixed(decimals))
                const finalValue = final === 'amount' ? _value - fee : _value + fee
                form.$(final).set('value', finalValue.toFixed(decimals))
            }

            if (this.blurStates.transferring.amount) {
                setFormInputsForFeesAndAmounts(this.transferForm)
            }

            if (this.blurStates.transferring.finalAmount) {
                setFormInputsForFeesAndAmounts(this.transferForm, 'finalAmount', 'amount')
            }

            if (this.blurStates.withdrawing.amount) {
                setFormInputsForFeesAndAmounts(this.withdrawalForm)
            }

            if (this.blurStates.withdrawing.finalAmount) {
                setFormInputsForFeesAndAmounts(this.withdrawalForm, 'finalAmount', 'amount')
            }
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
                this.uiStore.showToast('Failed to detect EOS Wallet', 'error')
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

            if (form.isValid) {
                if (!this.authStore.hasEOSWalletAccount) {
                    this.uiStore.showToast('Please connect an EOS wallet to continue.', 'error')
                    return
                }

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

                const transaction_id = await eos.transact(transaction)
                this.uiStore.showToast('Deposit successfully submitted!', 'success')
                this.uiStore.showToast('Click here to view your transaction', 'info', () =>
                    this.openTXInNewTab(transaction_id)
                )

                await sleep(2500)
                await this.authStore.fetchBalanceForSelectedToken()
                ;(form as any).clear()
            }
        } catch (error) {
            this.uiStore.showToast('Deposit failed to submit', 'error')
            throw error
        }
    }

    @computed get tokenDropdown() {
        const { supportedTokensForUnifiedWallet, selectedToken } = this.authStore

        return {
            name: 'token',
            label: 'Token',
            type: 'dropdown',
            extra: {
                options: supportedTokensForUnifiedWallet || [],
            },
            value:
                selectedToken ||
                (supportedTokensForUnifiedWallet.length && supportedTokensForUnifiedWallet[0]),
            rules: 'required',
            onSelect: selected => {
                this.authStore.selectedToken = selected
            },
        }
    }

    @computed get depositsForm() {
        return new CreateForm({}, [
            this.tokenDropdown,
            {
                name: 'amount',
                label: 'Amount',
                rules: 'required|numeric',
                autoComplete: 'off',
            },
            {
                name: 'memoId',
                label: 'Memo ID',
                rules: 'required',
                disabled: true,
                value: this.authStore.uidWalletPubKey,
                type: 'hidden',
                hideLabels: true,
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

            return submitRelayAsync([robj])
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
                this.loadingStates.withdrawing = false
                this.uiStore.showToast(data.message, 'error')
                return
            }

            const { transaction_id } = data

            this.uiStore.showToast('Withdrawal successfully submitted!', 'success')
            this.uiStore.showToast('Click here to view your transaction', 'info', () =>
                this.openTXInNewTab(transaction_id)
            )
            ;(form as any).clear()
            this.loadingStates.withdrawing = false

            await sleep(2000)
            await this.authStore.fetchBalanceForSelectedToken()
        } catch (error) {
            this.loadingStates.withdrawing = false
            this.uiStore.showToast('Withdrawal failed to submit', 'error')
            throw error
        }
    }

    @computed get withdrawalForm() {
        let min = 0

        if (this.authStore.supportedTokensForUnifiedWallet.length) {
            min = this.authStore.selectedToken.min
        }

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
                this.tokenDropdown,
                {
                    name: 'amount',
                    label: 'Amount',
                    rules: `required|numeric|min:${min}`,
                    autoComplete: 'off',
                    onFocus: () => {
                        this.blurStates.withdrawing.amount = true
                    },
                    onBlur: () => {
                        this.blurStates.withdrawing.amount = false
                    },
                },
                {
                    name: 'fee',
                    label: 'Fee',
                    disabled: true,
                },
                {
                    name: 'finalAmount',
                    label: 'Final Amount',
                    onFocus: () => {
                        this.blurStates.withdrawing.finalAmount = true
                    },
                    onBlur: () => {
                        this.blurStates.withdrawing.finalAmount = false
                    },
                },
                {
                    name: 'to',
                    label: 'To',
                    rules: 'required',
                    value: eos.auth ? eos.auth.accountName : '',
                    placeholder: 'An EOS account name',
                    autoComplete: 'off',
                },
                {
                    name: 'memo',
                    label: 'Memo',
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
                    if (form.isValid) {
                        this.authStore.hasRenteredPassword = true
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

                            this.uiStore.hideModal()
                            this.authStore.setWalletPrivateKey(walletPrivateKey)

                            if (this.loadingStates.withdrawing) {
                                this.handleWithdrawalSubmit(walletPrivateKey)
                            }

                            if (this.loadingStates.transferring) {
                                this.handleTransferSubmit(walletPrivateKey)
                            }
                        } catch (error) {
                            form.$('password').invalidate(error.message)
                            this.authStore.setWalletPrivateKey('false')
                            return error
                        }
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
                this.uiStore.showToast(data.message, 'error')
                return
            }

            const { transaction_id } = data

            this.uiStore.showToast('Transfer successfully submitted!', 'success')
            this.uiStore.showToast('Click here to view your transaction', 'info', () =>
                this.openTXInNewTab(transaction_id)
            )
            ;(form as any).clear()
            this.loadingStates.transferring = false

            await sleep(2000)
            await this.authStore.fetchBalanceForSelectedToken()
        } catch (error) {
            this.loadingStates.transferring = false
            this.uiStore.showToast('Transfer failed to submit', 'error')
            throw error
        }
    }

    private openTXInNewTab = tx => {
        window.open(`https://bloks.io/transaction/${tx}`)
    }

    @computed get transferForm() {
        let min = 0

        if (this.authStore.supportedTokensForUnifiedWallet.length) {
            min = this.authStore.selectedToken.min
        }

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
                this.tokenDropdown,
                {
                    name: 'amount',
                    label: 'Amount',
                    rules: `required|numeric|min:${min}`,
                    autoComplete: 'off',
                    onFocus: () => {
                        this.blurStates.transferring.amount = true
                    },
                    onBlur: () => {
                        this.blurStates.transferring.amount = false
                    },
                },
                {
                    name: 'fee',
                    label: 'Fee',
                    disabled: true,
                },
                {
                    name: 'finalAmount',
                    label: 'Final Amount',
                    onFocus: () => {
                        this.blurStates.transferring.finalAmount = true
                    },
                    onBlur: () => {
                        this.blurStates.transferring.finalAmount = false
                    },
                },
                {
                    name: 'to',
                    label: 'To',
                    rules: 'required',
                    placeholder: 'i.e. EOS65RgavjK71JQxZZBV1Sj99fE2QN87SF55vKNi99mXg7ZW8sm2a',
                    autoComplete: 'off',
                },
                {
                    name: 'memo',
                    label: 'Memo',
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
