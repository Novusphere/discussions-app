import { persist } from 'mobx-persist'
import { observable } from 'mobx'
import { RootStore } from '@stores/index'

export class UserStore {
    @persist('map') following = observable.map<string, string>()
    @persist('map') watching = observable.map<string, [number, number]>() // [currentCount, prevCount]
    @persist('map') blockedUsers = observable.map<string, string>() // [pubKey, displayName]
    @persist('map') blockedPosts = observable.map<string, string>() // [asPathURL, yyyydd]
    @persist('map') delegated = observable.map<string, string>() // [name:pubKey:tagName, tagName]
    @persist('map') pinnedPosts = observable.map<string, string>() // [asPathURL, tagName]

    blockedByDelegation = observable.map<string, string>() // either blockedUsers or blockedPosts
    @persist('map') pinnedByDelegation = observable.map<string, string>() // [asPathURL, tagName]

    @persist('object')
    @observable
    activeDelegatedTag = { value: '', label: '' }

    constructor(rootStore: RootStore) {}
}
