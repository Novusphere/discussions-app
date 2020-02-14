import { action, computed, observable } from 'mobx'
import { SIGN_IN_OPTIONS } from '@globals'
import { RootStore } from '@stores'
import { bkToStatusJson } from '@utils'
import { discussions, init, eos } from '@novuspherejs'
import { parseCookies } from 'nookies'
import Cookie from 'mobx-cookie'
import { task } from 'mobx-task'
import { notification } from 'antd'

export class AuthStore {
    _hasAccountCookie = new Cookie('hasAccount')
    _hasEOSWallet = new Cookie('hasEOSWallet')
    _postPubKey = new Cookie('postPub')
    _postPrivKey = new Cookie('postPriv')
    _accountPrivKey = new Cookie('accountPrivKey')
    _accountPubKey = new Cookie('accountPubKey')
    _displayName = new Cookie('displayName')
    _uidwWalletPubKey = new Cookie('uidWalletPubKey')
    _bk = new Cookie('bk')

    @observable
    preferredSignInMethod: SIGN_IN_OPTIONS = SIGN_IN_OPTIONS.brainKey

    @observable supportedTokensImages: { [symbol: string]: string } = {}

    /**
     * Used in transaction payload
     * when running actions such as depositing
     */
    @observable
    eosWalletDisplayName = ''

    // used for password re-entry
    @observable TEMP_WalletPrivateKey = ''

    constructor(rootStore: RootStore) {}

    @computed get hasAccount() {
        if (!this._hasAccountCookie.value) return false
        return JSON.parse(this._hasAccountCookie.value)
    }

    @computed get hasEOSWallet() {
        return JSON.parse(this._hasEOSWallet.value)
    }

    @computed get displayName() {
        return this._displayName.value
    }

    @computed get postPub() {
        return this._postPubKey.value
    }

    @computed get postPriv() {
        return this._postPrivKey.value
    }

    @computed get uidwWalletPubKey() {
        return this._uidwWalletPubKey.value
    }

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
            this.setPostPrivCookie(keys.post.priv)
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
        console.log('called')
        this.setHasAccountCookie('false')
    }

    setUidWalletPubKeyCookie = (value: string) => {
        // refresh this key
        this._uidwWalletPubKey = new Cookie('uidWalletPubKey')
        this._uidwWalletPubKey.set(value)
    }

    setPostPrivCookie = (value: string) => {
        // refresh this key
        this._postPrivKey = new Cookie('postPriv')
        this._postPrivKey.set(value)
    }

    setAccountKey = ({ pub, priv }) => {
        // refresh this key
        this._accountPrivKey = new Cookie('accountPrivKey')
        this._accountPrivKey.set(priv)

        this._accountPubKey = new Cookie('accountPubKey')
        this._accountPubKey.set(pub)
    }

    setHasAccountCookie = (value: string) => {
        // refresh this key
        this._hasAccountCookie = new Cookie('hasAccount')
        this._hasAccountCookie.set(value)
    }

    setHasEOSWalletCookie = (value: string) => {
        // refresh this key
        this._hasEOSWallet = new Cookie('hasEOSWallet')
        this._hasEOSWallet.set(value)
    }

    setBKCookie = (value: string) => {
        // refresh this key
        this._bk = new Cookie('bk')
        this._bk.set(value)
    }

    setPostPubCookie = (value: string) => {
        // refresh this key
        this._postPubKey = new Cookie('postPub')
        this._postPubKey.set(value)
    }

    setDisplayNameCookie = (value: string) => {
        // refresh this key
        this._displayName = new Cookie('displayName')
        this._displayName.set(value)
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
                this.setHasAccountCookie('true')
                this.storeKeys(brianKeyVerify)
            }
        } catch (error) {
            throw error
        }
    }

    signInWithPassword = async (password: string) => {
        try {
            const { bk } = parseCookies(window)

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
                this.setHasEOSWalletCookie('false')
                notification.success({
                    message: 'Success',
                    description: 'You have disconnected your EOS wallet',
                })
            } else {
                const wallet = await this.initializeScatterLogin()

                if (wallet && wallet.connected) {
                    this.eosWalletDisplayName = wallet.auth.accountName
                    ;(wallet as any).connect()
                    this.setHasEOSWalletCookie('true')
                } else {
                    this.setHasEOSWalletCookie('false')
                }
            }
        } catch (error) {
            throw error
        }
    })
}
