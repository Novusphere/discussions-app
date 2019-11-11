import { observable, action, when, reaction, computed } from 'mobx'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { persist } from 'mobx-persist'
import { computedFn } from 'mobx-utils'
import { getNewAuthStore, IStores } from '@stores/index'
import { getIdenticon } from '@utils'

export default class User extends BaseStore {
    /**
     * Observable map of users the current account is following
     * TODO: Sync with an API
     * {
     *     username: pub
     * }
     */
    @persist('map') @observable following = observable.map<string, string>()

    @persist @observable userIcon = ''

    private readonly authStore: IStores['newAuthStore'] = getNewAuthStore()

    constructor(props) {
        super(props)

        reaction(
            () => this.authStore.postPriv,
            (priv) => {
                if (priv) {
                    this.userIcon = getIdenticon(this.authStore.activePublicKey)
                }
            }
        )
    }

    @computed get followingKeys() {
        return Array.from(this.following.values())
    }

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
