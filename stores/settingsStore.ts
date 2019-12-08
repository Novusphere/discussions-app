import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, observable, reaction } from 'mobx'
import { persist } from 'mobx-persist'

export default class SettingsStore extends BaseStore {
    @persist @observable localStorageVersion = '2.0.0'

    @observable moderationSubValue = null

    @observable moderationMembers = observable.array<string>([
        'gux',
        'someuser'
    ])

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
}

export const getSettingsStore = getOrCreateStore('settingsStore', SettingsStore)
