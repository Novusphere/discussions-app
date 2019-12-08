import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, observable, reaction } from 'mobx'
import { persist } from 'mobx-persist'
import { CreateForm } from '@components'
import { task } from 'mobx-task'
import axios from 'axios'
import { getAuthStore, IStores } from '@stores/index'
import { sleep } from '@utils'

const fileDownload = require('js-file-download')

export default class SettingsStore extends BaseStore {
    @persist @observable localStorageVersion = '2.0.0'

    @observable moderationSubValue = null

    @observable moderationMembers = observable.array<string>(['gux', 'someuser'])

    private readonly authStore: IStores['authStore'] = getAuthStore()

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
    setModerationMembers(members: string[]) {
        this.moderationMembers.replace(members)
    }

    @task.resolved
    @action.bound
    async handleAirDropSubmit(form) {
        const values = form.values()

        const accountNames = values.accountNames

        try {
            // validate account names
            const invalidNames = []

            await accountNames
                .split(',')
                .slice()
                .map(async accountName => {
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

            await sleep(50 * accountNames.length)

            if (invalidNames.length) {
                form.$('accountNames').invalidate(
                    `The names: ${invalidNames.join(
                        ','
                    )} are invalid. Ensure you are entering a valid EOS username.`
                )
            }

            await sleep(500)

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

    get airdropForm() {
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
                    options: [
                        {
                            label: 'novusphereio',
                            value: 'ATMOS',
                        },
                    ],
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
