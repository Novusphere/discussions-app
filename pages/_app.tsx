import App from 'next/app'
import React from 'react'
import { initializeStore, InjectStoreContext } from '@stores'
import { Layout } from '@components'
import { parseCookies } from 'nookies'
import { SIGN_IN_OPTIONS } from '@globals'
import { DefaultSeo } from 'next-seo'

import '../assets/main.scss'

class DiscussionsApp extends App<any> {
    // Fetching serialized(JSON) store state
    static async getInitialProps(appContext) {
        let pageProps = {}

        const cookies = parseCookies(appContext.ctx)

        const initialStoreData = initializeStore({
            authStore: {
                // set inside a value object because of next-cookies reads from value property
                _uidwWalletPubKey: {
                    value: cookies.uidWalletPubKey || '',
                },
                _bk: {
                    value: cookies.bk || '',
                },
                _postPrivKey: {
                    value: cookies.postPriv || '',
                },
                _postPubKey: {
                    value: cookies.postPub || '',
                },
                _displayName: {
                    value: cookies.displayName || '',
                },
                _accountPrivKey: {
                    value: cookies.accountPrivKey || '',
                },
                _accountPubKey: {
                    value: cookies.accountPubKey || '',
                },
                _hasAccountCookie: {
                    value: cookies.hasOwnProperty('hasAccount')
                        ? JSON.parse(cookies.hasAccount)
                        : false,
                },
                _hasEOSWallet: {
                    value: cookies.hasOwnProperty('hasEOSWallet')
                        ? JSON.parse(cookies.hasEOSWallet)
                        : false,
                },
                preferredSignInMethod: cookies.preferredSignInMethod || SIGN_IN_OPTIONS.brainKey,
            },
            userStore: {
                pinnedPosts: cookies.pinnedByDelegation
                    ? JSON.parse(
                          Buffer.from(cookies.pinnedByDelegation, 'base64').toString('ascii')
                      )
                    : {},
            },
            uiStore: {
                _hideSidebar: {
                    value: cookies.hasOwnProperty('hideSideBar')
                        ? JSON.parse(cookies.hideSideBar)
                        : false,
                },
            },
        })

        const Component = appContext.Component

        appContext.ctx.store = initialStoreData

        // Provide the store to getInitialProps of pages
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps({ ...appContext.ctx, initialStoreData })
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
