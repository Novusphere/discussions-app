import App from 'next/app'
import React from 'react'
import * as Stores from '@stores'
import { Provider, useStaticRendering } from 'mobx-react'
import { MainLayout } from '@components'
import { withMobx } from 'next-mobx-wrapper'
import { isServer, pageview } from '@utils'
import { create } from 'mobx-persist'
import { toast } from 'react-toastify'
import { DefaultSeo } from 'next-seo'
import Router from 'next/router'

import '../styles/style.scss'
import { eos } from '@novuspherejs'

// configure({ enforceActions: 'observed' })
useStaticRendering(isServer) // NOT `true` value
toast.configure()

Router.events.on('routeChangeComplete', url => pageview(url))

export const hydrate = storage =>
    create({
        storage: storage,
        jsonify: true,
    })

class DiscussionApp extends App {
    public props: any

    /**
     * Hydrate the store for LS here
     * Due to SSR, we have to execute this part
     * on the client.
     */
    async componentDidMount(): Promise<void> {
        if (!isServer) {
            await eos.initializeTokens()
            await eos.init({
                host: 'nodes.get-scatter.com',
                port: 443,
                protocol: 'https',
                chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
            })

            const {
                authStore,
                settingsStore,
                userStore,
                notificationsStore,
                tagStore,
            } = this.props.store

            const stores = {
                auth: authStore,
                settings: settingsStore,
                user: userStore,
                notifications: notificationsStore,
                tags: tagStore,
            }

            Object.keys(stores).forEach(store => {
                hydrate(localStorage)(store, stores[store])
            })

            settingsStore.setTokens(eos.tokens)
        }
    }

    public render() {
        const { Component, pageProps, store } = (this as any).props

        return (
            <Provider {...store}>
                <MainLayout>
                    <DefaultSeo
                        openGraph={{
                            type: 'website',
                            locale: 'en_US',
                            url: 'https://www.beta.discussions.app/',
                            site_name: 'Discussions App',
                            images: [
                                {
                                    url: store.tagStore.activeTag
                                        ? store.tagStore.activeTag.icon
                                        : 'https://cdn.novusphere.io/static/atmos2.png',
                                    width: 250,
                                    height: 250,
                                    alt: store.tagStore.activeTag
                                        ? store.tagStore.activeTag.name
                                        : 'Discussions App',
                                },
                            ],
                        }}
                        twitter={{
                            site: '@thenovusphere',
                            cardType: 'summary',
                        }}
                    />
                    <Component {...pageProps} />
                </MainLayout>
            </Provider>
        )
    }
}

export default withMobx(Stores)(DiscussionApp)
