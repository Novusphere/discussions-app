import App from 'next/app'
import React from 'react'
import { Provider } from 'mobx-react'
import { initializeStore, InjectStoreContext, RootStore } from '@stores'
import { Layout } from '@components'
import { parseCookies } from 'nookies'
import { create } from 'mobx-persist'
import { SIGN_IN_OPTIONS } from '@globals'
import { eos } from '@novuspherejs';

import '../assets/main.scss'

class DiscussionsApp extends App<any> {
    // state = {
    //     store: new RootStore(),
    // }

    // Fetching serialized(JSON) store state
    static async getInitialProps(appContext) {
        let pageProps = {}

        const cookies = parseCookies(appContext.ctx)
        const initialStoreData = initializeStore({
            authStore: {
                uidwWalletPubKey: cookies.uidwWalletPubKey || '',
                postPriv: cookies.postPriv || '',
                postPub: cookies.postPub || '',
                displayName: cookies.displayName || '',
                hasAccount: cookies.hasAccount ? Boolean(cookies.hasAccount) : false,
                hasEOSWallet: cookies.hasEOSWallet ? Boolean(cookies.hasEOSWallet) : false,
                preferredSignInMethod: cookies.preferredSignInMethod || SIGN_IN_OPTIONS.brainKey,
            }
        })

        const Component = appContext.Component
        // const store = new RootStore()
        // const refreshed = store.hydrate(initialStoreData as any)

        appContext.ctx.store = initialStoreData

        // const appProps: any = await App.getInitialProps(appContext)

        // overwrite some props before parsing serialized store
        // if (appProps.pageProps.hasOwnProperty('position')) {
        //     data.postsStore = {
        //         ...data.postsStore,
        //         postsPosition: appProps.pageProps.position,
        //     }
        // }
        //
        // if (appProps.pageProps.hasOwnProperty('posts')) {
        //     data.postsStore = {
        //         ...data.postsStore,
        //         posts: appProps.pageProps.posts,
        //     }
        // }

        // Provide the store to getInitialProps of pages
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps({ ...appContext.ctx, initialStoreData })
        }

        return {
            pageProps,
            initialStoreData,
        }
    }

    // Hydrate serialized state to store
    // static getDerivedStateFromProps(props, state) {
    //     state.store.hydrate(props.initialStoreData)
    //     return state
    // }

    async componentDidMount(): Promise<void> {
        await eos.initializeTokens()
        await eos.init({
            host: 'nodes.get-scatter.com',
            port: 443,
            protocol: 'https',
            chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
        })
    }

    render() {
        const { Component, pageProps, initialStoreData } = this.props

        return (
            <InjectStoreContext initialData={initialStoreData}>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </InjectStoreContext>
        )
    }
}
export default DiscussionsApp
