import App, { Container } from 'next/app'
import React from 'react'
import * as Stores from '@stores'
import { Provider, useStaticRendering } from 'mobx-react'
import { MainLayout } from '@components'
import { withMobx } from 'next-mobx-wrapper'
import localForage from 'localforage'
import { isServer } from '@utils'
import { create } from 'mobx-persist'

import '../styles/style.scss'

// import { configure } from 'mobx'
// configure({ enforceActions: 'observed' })
useStaticRendering(isServer) // NOT `true` value

class DiscussionApp extends App {
    public props: any

    static async getInitialProps(ctx) {
        const isServer = !!ctx.req
        let pageProps = {}
        //
        if (ctx.Component.getInitialProps) {
            pageProps = await ctx.Component.getInitialProps(ctx)
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
                jsonify: false
            })

            hydrate('auth', this.props.store.authStore)
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
