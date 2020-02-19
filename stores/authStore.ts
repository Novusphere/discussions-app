import { action, observable } from 'mobx'
import { SIGN_IN_OPTIONS } from '@globals'
import { RootStore } from '@stores'
import { bkToStatusJson } from '@utils'
import { discussions, init, eos } from '@novuspherejs'
import { task } from 'mobx-task'
import { notification } from 'antd'
import { persist } from 'mobx-persist'

export class AuthStore {
    // _hasAccountCookie = new Cookie('hasAccount')
    // _hasEOSWallet = new Cookie('hasEOSWallet')
    // _postPubKey = new Cookie('postPub')
    // _accountPubKey = new Cookie('accountPubKey')
    // _displayName = new Cookie('displayName')
    // _uidwWalletPubKey = new Cookie('uidWalletPubKey')
    // _bk = new Cookie('bk')

    @persist('object')
    @observable
    bk = null

    @persist
    @observable
    hasAccount = false

    @persist
    @observable
    hasEOSWallet = false

    @persist
    @observable
    displayName = ''

    @persist
    @observable
    postPub = ''

    @persist
    @observable
    uidwWalletPubKey = ''

    @persist
    @observable
    accountPubKey = ''

    @persist
    @observable
    preferredSignInMethod: SIGN_IN_OPTIONS = SIGN_IN_OPTIONS.brainKey

    @observable supportedTokensImages: { [symbol: string]: string } = {}

    @persist
    @observable
    postPriv = ''

    @persist
    @observable
    accountPrivKey = ''

    /**
     * Used in transaction payload
     * when running actions such as depositing
     */
    @observable
    eosWalletDisplayName = ''

    // used for password re-entry
    @observable TEMP_WalletPrivateKey = ''

    constructor(rootStore: RootStore) {}

    @action.bound
    setTEMPPrivateKey = key => {
        this.TEMP_WalletPrivateKey = key
    }

    @action.bound
    setPreferredSignInMethod(method: SIGN_IN_OPTIONS) {
        if (this.preferredSignInMethod === method) this.preferredSignInMethod = SIGN_IN_OPTIONS.none
        else this.preferredSignInMethod = method
    }

    private storeKeys = async (bk: string) => {
        try {
            const keys = await discussions.bkToKeys(bk)
            this.postPriv = keys.post.priv
            this.setUidWalletPubKeyCookie(keys.uidwallet.pub)
            this.setAccountKey({ pub: keys.account.pub, priv: keys.account.priv })
            return keys
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    generateBrainKey = () => {
        return discussions.bkCreate()
    }

    logOut = () => {
        this.setHasAccountCookie(false)
    }

    setUidWalletPubKeyCookie = (value: string) => {
        this.uidwWalletPubKey = value
    }

    setAccountKey = ({ pub, priv }) => {
        this.accountPrivKey = priv
        this.accountPubKey = pub
    }

    setHasAccountCookie = (value: boolean) => {
        this.hasAccount = value
    }

    setHasEOSWalletCookie = (value: boolean) => {
        this.hasEOSWallet = value
    }

    setBKCookie = (value: string) => {
        this.bk = value
    }

    setPostPubCookie = (value: string) => {
        this.postPub = value
    }

    setDisplayNameCookie = (value: string) => {
        this.displayName = value
    }

    signInWithBK = async (brianKeyVerify, displayName, password) => {
        try {
            const bkIsValid = discussions.bkIsValid(brianKeyVerify)

            if (!bkIsValid) {
                throw new Error('You have entered an invalid brain key')
            }

            const unparsedJSON = await bkToStatusJson(brianKeyVerify, displayName, password, null)

            if (unparsedJSON) {
                const statusJSON = JSON.parse(unparsedJSON)
                this.setDisplayNameCookie(statusJSON.displayName)
                this.setBKCookie(unparsedJSON)
                this.setPostPubCookie(statusJSON.post)
                this.setHasAccountCookie(true)
                this.storeKeys(brianKeyVerify)
            }
        } catch (error) {
            throw error
        }
    }

    signInWithPassword = async (password: string) => {
        try {
            const { bk } = this

            if (typeof bk === 'undefined') {
                throw new Error('No active BK found, please log in with another BK.')
            }

            const bkFromStatusJSON = await discussions.bkFromStatusJson(bk, password)
            const statusJSON = JSON.parse(bk)
            this.signInWithBK(bkFromStatusJSON, statusJSON['displayName'], password)
        } catch (error) {
            throw error
        }
    }

    initializeScatterLogin = async (): Promise<any> => {
        try {
            await init()
            const wallet = await eos.detectWallet()

            if (typeof wallet !== 'boolean' && wallet) {
                // prompt login
                await eos.login()
                return wallet as any
            } else {
                throw new Error('Failed to detect EOS wallet')
            }
        } catch (error) {
            notification.error({
                message: 'Failed',
                description: 'Unable to detect EOS wallet',
            })
            return error
        }
    }

    connectScatterWallet = task.resolved(async (hasEOSWallet = false) => {
        try {
            if (hasEOSWallet) {
                // disconnect
                await eos.logout()
                this.setHasEOSWalletCookie(false)
                notification.success({
                    message: 'Success',
                    description: 'You have disconnected your EOS wallet',
                })
            } else {
                const wallet = await this.initializeScatterLogin()

                if (wallet && wallet.connected) {
                    this.eosWalletDisplayName = wallet.auth.accountName
                    ;(wallet as any).connect()
                    this.setHasEOSWalletCookie(true)
                } else {
                    this.setHasEOSWalletCookie(false)
                }
            }
        } catch (error) {
            throw error
        }
    })
}
