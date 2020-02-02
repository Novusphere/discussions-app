import { useStaticRendering } from 'mobx-react'
import { isServer } from '@utils'
import { AuthStore } from '@stores/authStore'
import { createContext } from 'react'
import { UIStore } from '@stores/uiStore'
import { SIGN_IN_OPTIONS } from '@globals'
import { set } from 'mobx'

useStaticRendering(isServer)

export class RootStore {
    authStore = null
    uiStore = null

    hydrate({ authStore, uiStore }) {
        this.authStore = new AuthStore(this)
        set(this.authStore, authStore)

        this.uiStore = new UIStore(this)
        set(this.uiStore, uiStore)

        return this
    }
}

export async function fetchInitialStoreState(cookies) {
    return {
        authStore: {
            uidwWalletPubKey: cookies.uidwWalletPubKey || '',
            postPriv: cookies.postPriv || '',
            displayName: cookies.displayName || '',
            hasAccount: cookies.hasAccount ? JSON.parse(cookies.hasAccount) : false,
            hasEOSWallet: cookies.hasEOSWallet ? JSON.parse(cookies.hasEOSWallet) : false,
            preferredSignInMethod: cookies.preferredSignInMethod || SIGN_IN_OPTIONS.brainKey,
        },
    }
}

export const RootStoreContext = createContext(new RootStore())
