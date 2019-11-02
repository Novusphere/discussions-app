import { observable, action } from 'mobx'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { persist } from 'mobx-persist'
import { computedFn } from 'mobx-utils'

export default class User extends BaseStore {
    /**
     * Observable map of users the current account is following
     * TODO: Sync with an API
     * {
     *     pub: username
     * }
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

    isFollowingUser = computedFn((user: string) => {
        return this.following.has(user)
    })
}

export const getUserStore = getOrCreateStore('userStore', User)
