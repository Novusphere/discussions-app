import { CreateForm } from '@components'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { observable } from 'mobx'
import { persist } from 'mobx-persist'

export default class SettingsStore extends BaseStore {
    @persist @observable localStorageVersion = '2.0.0'

    @observable moderationSubValue = null

}

export const getSettingsStore = getOrCreateStore('settingsStore', SettingsStore)
