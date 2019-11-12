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
     *     pub: username
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
        return Array.from(this.following.keys())
    }

    @action.bound
    toggleUserFollowing(user: string, pub: string) {
        if (this.following.has(pub)) {
            this.following.delete(pub)
        } else {
            this.following.set(pub, user)
        }
    }

    isFollowingUser = computedFn((pub: string) => {
        return this.following.has(pub)
    })
}

export const getUserStore = getOrCreateStore('userStore', User)
