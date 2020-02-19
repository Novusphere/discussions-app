import App from 'next/app'
import React from 'react'
import { initializeStore, InjectStoreContext } from '@stores'
import { Layout } from '@components'
import { DefaultSeo } from 'next-seo'

import '../assets/main.scss'

class DiscussionsApp extends App<any> {
    // Fetching serialized(JSON) store state
    static async getInitialProps(appContext) {
        let pageProps = {}

        const initialStoreData = initializeStore()
        const Component = appContext.Component

        // Provide the store to getInitialProps of containers
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps({ ...appContext.ctx, store: initialStoreData })
        }

        return {
            pageProps,
            initialStoreData,
        }
    }

    render() {
        const { Component, pageProps, initialStoreData } = this.props

        return (
            <>
                <DefaultSeo
                    openGraph={{
                        type: 'website',
                        locale: 'en_US',
                        url: 'https://www.discussions.app/',
                        site_name: 'Discussions App',
                    }}
                    twitter={{
                        site: '@thenovusphere',
                        cardType: 'summary',
                    }}
                />
                <InjectStoreContext initialData={initialStoreData}>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </InjectStoreContext>
            </>
        )
    }
}
export default DiscussionsApp
