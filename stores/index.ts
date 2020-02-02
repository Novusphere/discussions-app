import { useStaticRendering } from 'mobx-react'
import { isServer } from '@utils'
import { AuthStore } from '@stores/authStore'
import { createContext } from 'react'
import { UIStore } from '@stores/uiStore'
import { SIGN_IN_OPTIONS } from '@globals'
import { set } from 'mobx'
import { TagStore } from '@stores/tagStore'
import { PostsStore } from '@stores/postsStore'
import { UserStore } from '@stores/userStore'
import { SettingsStore } from '@stores/settingsStore'

useStaticRendering(isServer)

export class RootStore {
    authStore = null
    uiStore = null
    tagStore = null
    postsStore = null
    userStore = null
    settingStore = null

    hydrate({ authStore, uiStore, tagStore, postsStore, userStore, settingStore }) {
        this.authStore = new AuthStore(this)
        set(this.authStore, authStore)

        this.uiStore = new UIStore(this)
        set(this.uiStore, uiStore)

        this.tagStore = new TagStore(this)
        set(this.tagStore, tagStore)

        this.postsStore = new PostsStore(this)
        set(this.postsStore, postsStore)

        this.userStore = new UserStore(this)
        set(this.userStore, userStore)

        this.settingStore = new SettingsStore(this)
        set(this.settingStore, settingStore)

        return this
    }
}

export async function fetchInitialStoreState(cookies) {
    return {
        authStore: {
            uidwWalletPubKey: cookies.uidwWalletPubKey || '',
            postPriv: cookies.postPriv || '',
            postPub: cookies.postPub || '',
            displayName: cookies.displayName || '',
            hasAccount: cookies.hasAccount ? JSON.parse(cookies.hasAccount) : false,
            hasEOSWallet: cookies.hasEOSWallet ? JSON.parse(cookies.hasEOSWallet) : false,
            preferredSignInMethod: cookies.preferredSignInMethod || SIGN_IN_OPTIONS.brainKey,
        },
    }
}

export const RootStoreContext = createContext(new RootStore())
