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

export type BlockedContentSetting = 'hidden' | 'collapsed'

export default class SettingsStore extends BaseStore {
    @persist @observable localStorageVersion = '2.0.0'

    @observable moderationSubValue = null
    @observable moderationMembers = observable.array<string>(['gux', 'someuser'])

    @persist
    @observable
    blockedContentSetting: BlockedContentSetting = 'hidden'

    @persist
    @observable
    unsignedPostsIsSpam = true

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
    setUnsignedPostsAsSpamSetting(setting: boolean) {
        this.unsignedPostsIsSpam = setting
    }

    @action.bound
    setBlockedContentSetting(type: BlockedContentSetting) {
        this.blockedContentSetting = type
    }

    @computed get blockedSettingForm() {
        return new CreateForm(
            {},
            [
                {
                    name: 'hidden',
                    label: 'Hidden',
                    type: 'switch',
                    description: "Hide blocked content entirely including all replies.",
                    value: this.blockedContentSetting === 'hidden',
                    onChange: value => {
                        if (value) this.setBlockedContentSetting('hidden')
                        else this.setBlockedContentSetting('collapsed')
                    }
                },
                {
                    name: 'collapsed',
                    label: 'Collapse',
                    type: 'switch',
                    description: "Auto-Collapse all blocked content, with the ability to expand the post.",
                    value: this.blockedContentSetting === 'collapsed',
                    onChange: value => {
                        if (value) this.setBlockedContentSetting('collapsed')
                        else this.setBlockedContentSetting('hidden')
                    }
                },
                {
                    name: 'unsignedPosts',
                    label: 'Hide Unsigned Posts',
                    type: 'switch',
                    description: "If a post has no signature hide it with the above settings.",
                    value: this.unsignedPostsIsSpam,
                    onChange: value => this.setUnsignedPostsAsSpamSetting(value)
                },
            ]
        )
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
    setModerationMembers(members: string[]) {
        this.moderationMembers.replace(members)
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
        values.actor = this.authStore.getActiveDisplayName

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
