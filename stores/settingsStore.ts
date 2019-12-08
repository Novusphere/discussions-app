import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, observable, reaction } from 'mobx'
import { persist } from 'mobx-persist'
import CreateForm from '../components/CreateForm/CreateForm'

export default class SettingsStore extends BaseStore {
    @persist @observable localStorageVersion = '2.0.0'

    @observable moderationSubValue = null

    @observable moderationMembers = observable.array<string>(['gux', 'someuser'])

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

    get airdropForm() {
        return new CreateForm(
            {
                onSubmit: form => {
                    console.log(form.values())
                },
            },
            [
                {
                    name: 'accountNames',
                    label: 'Account Names',
                    type: 'textarea',
                    placeholder: 'Enter an account name followed by a line break',
                    rules: 'required|string',
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
                    name: 'amount',
                    label: 'Amount',
                    rules: 'required|number',
                },
                {
                    name: 'memoId',
                    label: 'Memo ID',
                    rules: 'required',
                },
            ]
        )
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
