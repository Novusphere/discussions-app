import App from 'next/app'
import React from 'react'
import { Provider } from 'mobx-react'
import { fetchInitialStoreState, RootStore, RootStoreContext } from '@stores'
import { Layout } from '@components'
import { parseCookies } from 'nookies'
import { create } from 'mobx-persist'

const rootStore = new RootStore()

export const hydrate = storage =>
    create({
        storage: storage,
        jsonify: true,
    })

class DiscussionsApp extends App<any> {
    state = {
        store: rootStore,
    }

    // Fetching serialized(JSON) store state
    static async getInitialProps(appContext) {
        const cookies = parseCookies(appContext.ctx)
        const data = await fetchInitialStoreState(cookies)

        appContext.ctx.store = rootStore.hydrate(data as any)

        const appProps = await App.getInitialProps(appContext)

        return {
            ...appProps,
            data,
        }
    }

    // Hydrate serialized state to store
    static getDerivedStateFromProps(props, state) {
        state.store.hydrate(props.data)
        return state
    }

    componentDidMount(): void {
        const stores = {
            userStore: this.state.store.userStore,
            settingsStore: this.state.store.settingStore,
        }

        Object.keys(stores).forEach(store => {
            hydrate(localStorage)(store, stores[store])
        })
    }

    render() {
        const { Component, pageProps, data } = this.props
        return (
            <Provider {...this.state.store}>
                <RootStoreContext.Provider value={this.state.store}>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </RootStoreContext.Provider>
            </Provider>
        )
    }
}
export default DiscussionsApp
