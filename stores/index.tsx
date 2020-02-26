import * as React from 'react'
import { useStaticRendering } from 'mobx-react'
import { isServer } from '@utils'
import { AuthStore } from '@stores/authStore'
import { createContext, useContext } from 'react'
import { UIStore } from '@stores/uiStore'
import { TagStore } from '@stores/tagStore'
import { PostsStore } from '@stores/postsStore'
import { UserStore } from '@stores/userStore'
import { SettingsStore } from '@stores/settingsStore'
import { create } from 'mobx-persist'
import { WalletStore } from '@stores/walletStore'

useStaticRendering(isServer)

export const hydrate = (storage: Storage) =>
    create({
        storage: storage,
        jsonify: true,
    })

export class RootStore {
    uiStore = new UIStore()
    authStore = new AuthStore(this)
    tagStore = new TagStore(this)
    userStore = new UserStore(this)
    walletStore = new WalletStore(this)
    postsStore = new PostsStore(this)
    settingStore = new SettingsStore(this)
}

const StoreContext = createContext<any | null>(null)

function initializeStore() {
    const stores = new RootStore()

    if (isServer) {
        return stores
    }

    let rootStore = {}

    if (!Object.keys(rootStore).length) {
        rootStore = stores

        const hydr = {
            userStore: stores.userStore,
            tagStore: stores.tagStore,
            walletStore: stores.walletStore,
            authStore: stores.authStore,
        }

        Object.keys(hydr).forEach(store => {
            hydrate(localStorage)(store, hydr[store])
        })
    }

    return rootStore
}

function InjectStoreContext({ children, initialData }: any) {
    const store = initializeStore()
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

const useStores: any = () => useContext(StoreContext)

export { initializeStore, StoreContext, InjectStoreContext, useStores }
