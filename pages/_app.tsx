import App, {Container} from 'next/app'
import React from 'react'
import Stores from '../stores';
import {Provider} from 'mobx-react'
import {MainLayout} from "../components";

class DiscussionApp extends App {
    private stores: any;

    static async getInitialProps(ctx) {
        let userState = null;
        const isServer = !!ctx.req;

        if (isServer === true) {
            const User = Stores('__userStore__', {});
            userState = User.getUserFromCookie(ctx.req);
        }

        return {
            isServer,
            userState,
        };
    }

    constructor(props) {
        super(props);
        this.stores = {
            userStore: Stores('__userStore__', props.userState),
            uiStore: Stores('__uiStore__', {}),
            tagStore: Stores('__tagStore__', {}),
        }
    }

    async componentDidMount() {
        if (!(this as any).props.isServer) {
            const njs = await import('../novusphere-js');
            await njs.init();
            await njs.eos.detectWallet();
        }
    }

    public render() {
        const {Component, pageProps} = (this as any).props;
        return (
            <Container>
                <Provider {...this.stores}>
                    <MainLayout activeBanner={this.stores.uiStore.activeBanner} tags={this.stores.tagStore.tags}>
                        <Component {...pageProps} />
                    </MainLayout>
                </Provider>
            </Container>
        )
    }
}

export default DiscussionApp
