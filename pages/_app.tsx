import App, { Container } from 'next/app'
import React from 'react'
import * as Stores from '@stores/index'
import { Provider, useStaticRendering } from 'mobx-react'
import { MainLayout } from '@components'
import { init, eos } from '@novuspherejs/index'
import { withMobx } from 'next-mobx-wrapper'

const isServer = !(process as any).browser

// import { configure } from 'mobx'
// configure({ enforceActions: 'observed' })
useStaticRendering(isServer) // NOT `true` value

class DiscussionApp extends App {
    private props: any

    static async getInitialProps(ctx) {
        let userState = null
        const isServer = !!ctx.req

        let pageProps = {}

        if (ctx.Component.getInitialProps) {
            pageProps = await ctx.Component.getInitialProps(ctx)
        }

        return {
            isServer,
            userState,
            pageProps,
        }
    }

    async componentDidMount() {
        if (!isServer) {
            await init()
            const wallet = await eos.detectWallet()

            if (typeof wallet !== 'boolean' && wallet) {
                this.props.store.authStore.logIn()
            }
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
