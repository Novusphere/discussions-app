import App from 'next/app'
import React from 'react'
import { Provider } from 'mobx-react'
import { fetchInitialStoreState, RootStore, RootStoreContext } from '@stores'
import { Layout } from '@components'
import { parseCookies } from 'nookies'

class DiscussionsApp extends App<any> {
    state = {
        store: new RootStore(),
    }

    // Fetching serialized(JSON) store state
    static async getInitialProps(appContext) {
        const appProps = await App.getInitialProps(appContext)
        const cookies = parseCookies(appContext.ctx)
        const data = await fetchInitialStoreState(cookies)

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

    render() {
        const { Component, pageProps, data } = this.props
        return (
            <Provider {...this.state.store}>
                <RootStoreContext.Provider value={data}>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </RootStoreContext.Provider>
            </Provider>
        )
    }
}
export default DiscussionsApp
