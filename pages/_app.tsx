import App, { Container } from 'next/app'
import React from 'react'
import * as Stores from '@stores'
import { Provider, useStaticRendering } from 'mobx-react'
import { MainLayout } from '@components'
import { withMobx } from 'next-mobx-wrapper'
import { getVersion, isServer } from '@utils'
import { create } from 'mobx-persist'
import { toast } from 'react-toastify'

import '../styles/style.scss'

// configure({ enforceActions: 'observed' })
useStaticRendering(isServer) // NOT `true` value
toast.configure()


class DiscussionApp extends App {
    public props: any

    static async getInitialProps({ ctx, Component }) {
        const isServer = !!ctx.req
        let pageProps = {}
        //
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }

        return {
            isServer,
            pageProps,
        }
    }

    /**
     * Hydrate the store for LS here
     * Due to SSR, we have to execute this part
     * on the client.
     */
    async componentDidMount(): Promise<void> {
        if (!isServer) {
            const { newAuthStore, settingsStore, userStore } = this.props.store

            const stores = {
                auth: newAuthStore,
                settings: settingsStore,
                user: userStore,
            }

            const hydrate = create({
                storage: localStorage,
                jsonify: true,
            })

            Object.keys(stores).forEach(store => {
               hydrate(store, stores[store])

                // if (getVersion() !== this.props.store.settingsStore.localStorageVersion) {
                //     console.error('local storage version mismatch')
                //
                //     result.rehydrate().then(() => {
                //         console.log('store rehydrated')
                //     })
                // }
            })
        }
    }

    public render() {
        const { Component, pageProps, store } = (this as any).props
        return (
            <Container>
                <Provider {...store}>
                    <MainLayout
                        activeBanner={store.uiStore.activeBanner}
                        tags={store.tagStore.tags}
                    >
                        <Component {...pageProps} />
                    </MainLayout>
                </Provider>
            </Container>
        )
    }
}

export default withMobx(Stores)(DiscussionApp)
