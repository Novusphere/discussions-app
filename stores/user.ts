import { observable, action } from 'mobx'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { persist } from 'mobx-persist'
import { computedFn } from 'mobx-utils'

export default class User extends BaseStore {
    /**
     * List of following users
     * {
     *     name: displayName or poster
     *     pub: pub key
     * }[]
     */
    @persist('map') @observable following = observable.map<string, string>()

    @action.bound
    toggleUserFollowing(user: string, pub: string) {
        if (this.following.has(user)) {
            this.following.delete(user)
        } else {
            this.following.set(user, pub)
        }
    }

    isFollowingUser = computedFn((pub: string) => {
        return this.following.has(pub)
    })
}

export const getUserStore = getOrCreateStore('userStore', User)
