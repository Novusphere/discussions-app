import App, { Container } from 'next/app'
import React from 'react'
import Stores from '@stores/index'
import { Provider } from 'mobx-react'
import { MainLayout } from '@components'
import { init, eos } from '@novuspherejs/index'

class DiscussionApp extends App {
    private stores: any

    static async getInitialProps(ctx) {
        let userState = null
        const isServer = !!ctx.req

        if (isServer === true) {
            const User = Stores('__userStore__', {})
            userState = User.getUserFromCookie(ctx.req)
        }

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

    constructor(props) {
        super(props)
        this.stores = {
            userStore: Stores('__userStore__', props.userState),
            uiStore: Stores('__uiStore__', {}),
            tagStore: Stores('__tagStore__', {}),
            authStore: Stores('__authStore__', {}),
            postsStore: Stores('__postsStore__', {}),
            settingsStore: Stores('__settingsStore__', {}),
        }

        // FIXME: this might be necessary later
        props.pageProps.stores = this.stores
    }

    async componentDidMount() {
        await init()
        const wallet = await eos.detectWallet()

        if (typeof wallet !== 'boolean' && wallet) {
            this.stores.authStore.logIn()
        }
    }

    public render() {
        const { Component, pageProps } = (this as any).props
        return (
            <Container>
                <Provider {...this.stores}>
                    <MainLayout
                        activeBanner={this.stores.uiStore.activeBanner}
                        tags={this.stores.tagStore.tags}
                    >
                        <Component {...pageProps} />
                    </MainLayout>
                </Provider>
            </Container>
        )
    }
}

export default DiscussionApp
