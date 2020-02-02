import { persist } from 'mobx-persist'
import { observable } from 'mobx'
import { RootStore } from '@stores/index'

export type BlockedContentSetting = 'hidden' | 'collapsed'

export class SettingsStore {
    @persist
    @observable
    blockedContentSetting: BlockedContentSetting = 'hidden'

    @persist
    @observable
    unsignedPostsIsSpam = true

    constructor(rootStore: RootStore) {}
}
