import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, computed, observable, reaction } from 'mobx'
import { persist } from 'mobx-persist'
import { CreateForm } from '@components'
import { task } from 'mobx-task'
import axios from 'axios'
import { getAuthStore, IStores } from '@stores/index'
import { AIRDROP_THRESHOLD, sleep } from '@utils'
import { eos } from '@novuspherejs'

const fileDownload = require('js-file-download')

export default class SettingsStore extends BaseStore {
    @persist @observable localStorageVersion = '2.0.0'

    @observable moderationSubValue = null

    @observable moderationMembers = observable.array<string>(['gux', 'someuser'])

    @observable tokens = []

    private readonly authStore: IStores['authStore'] = getAuthStore()

    constructor() {
        super()

        axios
            .get(
                'https://raw.githubusercontent.com/Novusphere/eos-forum-settings/master/tokens.json'
            )
            .then(({ data }) => {
                this.tokens = data.map(q => ({ label: q.name, value: q.account, symbol: q.symbol }))
            })

        reaction(
            () => this.moderationSubValue,
            value => {
                // get moderators here
                this.setModerationMembers([])
            }
        )
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
    async handleAirDropSubmit(form) {
        const values = form.values()

        const accountNames = values.accountNames

        try {
            // validate account names
            const invalidNames = []

            console.log('validating account names')

            console.log(this.recipientCount)

            console.log(accountNames)

            await this.recipients.map(async accountName => {
                console.log(
                    'Class: SettingsStore, Function: await, Line 62 accountName: ',
                    accountName
                )

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

                console.log('Class: SettingsStore, Function: await, Line 77 data: ', data)

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

            console.log('account names: ', accountNames.length)
            console.log('threshold: ', AIRDROP_THRESHOLD)

            const precision = await eos.getTokenPrecision(values.token.value, values.token.label)
            const amount: string = values.amount

            values.amount = Number(amount).toFixed(precision)

            if (this.recipientCount < AIRDROP_THRESHOLD) {
                console.log('would send contract via scatter')

                // const action = {
                //     account: values.token.value,
                //     name: 'transfer',
                //     data: {
                //         from: eos.auth.accountName,
                //         to: recipient,
                //         quantity: `${values.amount} ${values.token.label}`,
                //         memo: values.memoId,
                //     },
                // }

                const actions = []

                // scatter detection
                console.log('detecting scatter')
                await eos.detectWallet()
                await eos.login()

                console.log('scatter detected, continuing')

                this.recipients.map(async recipient => {
                    actions.push({
                        account: values.token.value,
                        name: 'transfer',
                        data: {
                            from: eos.auth.accountName,
                            to: recipient,
                            quantity: `${values.amount} ${values.token.label}`,
                            memo: values.memoId,
                        },
                    })
                })

                console.log('running eos.transact for all recipients')
                const txIds = await eos.transact(actions)

                console.log(
                    'Class: SettingsStore, Function: handleAirDropSubmit, Line 111 txIds: ',
                    txIds
                )

                return
            }

            values.actor = this.authStore.getActiveDisplayName

            if (form.hasError) return

            console.log(values)

            const { data } = await axios.get('/api/writeFile', {
                params: values,
            })

            fileDownload(JSON.stringify(data), 'airdrop.json')
        } catch (error) {
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
                    options: this.tokens,
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
                            title: 'Generate AirDrop File',
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
