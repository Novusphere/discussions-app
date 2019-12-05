import { CreateForm } from '@components'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, observable, reaction } from 'mobx'
import { persist } from 'mobx-persist'

export default class SettingsStore extends BaseStore {
    @persist @observable localStorageVersion = '2.0.0'

    @observable moderationSubValue = null

    @observable moderationMembers = observable.array<string>()

    constructor() {
        super()

        reaction(
            () => this.moderationSubValue,
            value => {
                this.setModerationMembers([String(Math.random()), String(Math.random())])
            }
        )
    }

    @action.bound
    setModerationMembers(members: string[]) {
        this.moderationMembers.replace(members)
    }
}

export const getSettingsStore = getOrCreateStore('settingsStore', SettingsStore)
