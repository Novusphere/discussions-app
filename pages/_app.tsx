import App from 'next/app'
import React from 'react'
import * as Stores from '@stores'
import { Provider, useStaticRendering } from 'mobx-react'
import { MainLayout } from '@components'
import { withMobx } from 'next-mobx-wrapper'
import { isServer } from '@utils'
import { create } from 'mobx-persist'
import { toast } from 'react-toastify'
import { DefaultSeo } from 'next-seo'

import '../styles/style.scss'

// configure({ enforceActions: 'observed' })
useStaticRendering(isServer) // NOT `true` value
toast.configure()

class DiscussionApp extends App {
    public props: any

    // static async getInitialProps({ ctx, Component }) {
    //     const isServer = !!ctx.req
    //     let pageProps = {}
    //     //
    //     if (Component.getInitialProps) {
    //         pageProps = await Component.getInitialProps(ctx)
    //     }
    //
    //     return {
    //         isServer,
    //         pageProps,
    //     }
    // }

    /**
     * Hydrate the store for LS here
     * Due to SSR, we have to execute this part
     * on the client.
     */
    async componentDidMount(): Promise<void> {
        if (!isServer) {
            const {
                newAuthStore,
                settingsStore,
                userStore,
                notificationsStore,
                tagStore,
            } = this.props.store

            const stores = {
                auth: newAuthStore,
                settings: settingsStore,
                user: userStore,
                notifications: notificationsStore,
                tags: tagStore,
            }

            const hydrate = create({
                storage: localStorage,
                jsonify: true,
            })

            Object.keys(stores).forEach(store => {
                hydrate(store, stores[store]).rehydrate()

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
                                        : 'https://cdn.novusphere.io/static/atmos.svg',
                                    width: 800,
                                    height: 600,
                                    alt: store.tagStore.activeTag
                                        ? store.tagStore.activeTag.name
                                        : 'Discussions App',
                                },
                            ],
                        }}
                    />
                    <Component {...pageProps} />
                </MainLayout>
            </Provider>
        )
    }
}

export default withMobx(Stores)(DiscussionApp)
