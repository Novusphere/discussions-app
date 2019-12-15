import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, computed, observable, reaction } from 'mobx'
import { persist } from 'mobx-persist'
import { CreateForm } from '@components'
import { task } from 'mobx-task'
import axios from 'axios'
import { getAuthStore, getUiStore, IStores } from '@stores/index'
import { sleep } from '@utils'
import { eos } from '@novuspherejs'

const fileDownload = require('js-file-download')

export default class SettingsStore extends BaseStore {
    @persist @observable localStorageVersion = '2.0.0'
    @observable moderationSubValue = null
    @observable moderationMembers = observable.array<string>(['gux', 'someuser'])
    @observable tokens = []
    @observable thresholdTxID = ''
    @observable errorMessage = ''

    private readonly authStore: IStores['authStore'] = getAuthStore()
    private readonly uiStore: IStores['uiStore'] = getUiStore()

    constructor() {
        super()

        reaction(
            () => this.moderationSubValue,
            value => {
                // get moderators here
                this.setModerationMembers([])
            }
        )
    }

    @action.bound
    setTokens(tokens: any) {
        this.tokens = tokens.map(q => {
            return ({
                label: `${q.name} (${q.account})`,
                name: q.name,
                value: q.account,
                symbol: q.symbol
            });
        })
    }

    @action.bound
    setModerationMembers(members: string[]) {
        this.moderationMembers.replace(members)
    }

    @computed get recipients() {
        if (!this.airdropForm.form.$('accountNames').value) return []
        return this.airdropForm.form.$('accountNames').value.split(',')
    }

    @computed get recipientCount() {
        if (!this.airdropForm.form.$('accountNames').value) return 0
        return this.airdropForm.form.$('accountNames').value.split(',').length
    }

    @task.resolved
    @action.bound
    async handleDownloadAirDropSubmit(form) {
        const values = form.values()

        const accountNames = values.accountNames

        try {
            // validate account names
            const invalidNames = []

            await this.recipients.map(async accountName => {
                await sleep(100)

                const { data, status } = await axios.post(
                    'https://eos.eoscafeblock.com/v1/chain/get_table_by_scope',
                    {
                        code: 'eosio',
                        table: 'userres',
                        lower_bound: accountName,
                        upper_bound: accountName,
                        limit: 1,
                    }
                )

                if (!data.rows.length || status !== 200) {
                    invalidNames.push(accountName)
                }
            })

            await sleep(100 * accountNames.length)

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
            values.actor = this.authStore.getActiveDisplayName

            if (form.hasError) return

            const { data } = await axios.get('/api/writeFile', {
                params: values,
            })

            fileDownload(JSON.stringify(data), 'airdrop.json')
        } catch (error) {
            return error
        }
    }

    @task.resolved
    @action.bound
    async handleAirDropSubmit(form) {
        const values = form.values()

        const accountNames = values.accountNames

        try {
            // validate account names
            const invalidNames = []

            await this.recipients.map(async accountName => {
                await sleep(100)

                const { data, status } = await axios.post(
                    'https://eos.eoscafeblock.com/v1/chain/get_table_by_scope',
                    {
                        code: 'eosio',
                        table: 'userres',
                        lower_bound: accountName,
                        upper_bound: accountName,
                        limit: 1,
                    }
                )

                if (!data.rows.length || status !== 200) {
                    invalidNames.push(accountName)
                }
            })

            await sleep(100 * accountNames.length)

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
            values.actor = this.authStore.getActiveDisplayName

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
                description: 'Enter an account followed by a comma, i.e. account1,account2',
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

    get withdrawalForm() {
        return new CreateForm(
            {
                onSubmit: form => {
                    console.log(form.values())
                },
            },
            [
                {
                    name: 'amount',
                    label: 'Amount',
                    rules: 'required',
                    hide: true,
                },
                {
                    name: 'token',
                    label: 'Token',
                    type: 'dropdown',
                    extra: {
                        options: [
                            {
                                label: 'ATMOS',
                                value: 'ATMOS',
                            },
                        ],
                    },
                    rules: 'required',
                },
                {
                    name: 'to',
                    label: 'To',
                    rules: 'required',
                },
            ]
        )
    }

    get depositForm() {
        return new CreateForm(
            {
                onSubmit: form => {
                    console.log(form.values())
                },
            },
            [
                {
                    name: 'amount',
                    label: 'Amount',
                    rules: 'required',
                    hide: true,
                },
                {
                    name: 'token',
                    label: 'Token',
                    type: 'dropdown',
                    extra: {
                        options: [
                            {
                                label: 'ATMOS',
                                value: 'ATMOS',
                            },
                        ],
                    },
                    rules: 'required',
                },
            ]
        )
    }
}

export const getSettingsStore = getOrCreateStore('settingsStore', SettingsStore)
