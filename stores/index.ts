import { useStaticRendering } from 'mobx-react'
import { isServer } from '@utils'
import { AuthStore } from '@stores/authStore'
import { createContext } from 'react'

useStaticRendering(isServer)

export class RootStore {
    authStore = new AuthStore(this)

    hydrate({ authStore }) {
        this.authStore = authStore
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
        },
    }
}

export const RootStoreContext = createContext(new RootStore())
