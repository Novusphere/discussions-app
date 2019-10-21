import App, { Container } from 'next/app'
import React from 'react'
import * as Stores from '@stores'
import { Provider, useStaticRendering } from 'mobx-react'
import { MainLayout } from '@components'
import { withMobx } from 'next-mobx-wrapper'
import localForage from 'localforage'
import { isServer } from '@utils'
import { create } from 'mobx-persist'
import { toast } from 'react-toastify'
import { configure } from 'mobx'

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
            const hydrate = create({
                storage: localForage,
                jsonify: false,
            })

            hydrate('auth', this.props.store.authStore)
            hydrate('newAuth', this.props.store.newAuthStore)
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
