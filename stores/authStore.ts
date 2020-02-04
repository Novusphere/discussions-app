import { action, computed, observable } from 'mobx'
import { SIGN_IN_OPTIONS } from '@globals'
import { RootStore } from '@stores'
import { bkToStatusJson } from '@utils'
import { discussions } from '@novuspherejs'
import { setCookie, parseCookies } from 'nookies'
import Cookie from 'mobx-cookie'

export class AuthStore {
    _hasAccountCookie = new Cookie('hasAccount')
    _postPubKey = new Cookie('postPub')
    _postPrivKey = new Cookie('postPriv')
    _displayName = new Cookie('displayName')
    _uidwWalletPubKey = new Cookie('uidWalletPubKey')

    @observable
    preferredSignInMethod: SIGN_IN_OPTIONS = SIGN_IN_OPTIONS.brainKey


    @observable
    hasEOSWallet = false

    @observable supportedTokensImages: { [symbol: string]: string } = {}

    // used for password re-entry
    @observable TEMP_WalletPrivateKey = ''

    constructor(rootStore: RootStore) {}

    @computed get hasAccount() {
        return JSON.parse(this._hasAccountCookie.value)
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
            setCookie(null, 'postPriv', keys.post.priv, { path: '/' })
            setCookie(null, 'uidWalletPubKey', keys.uidwallet.pub, { path: '/' })
            return keys
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    logOut = () => {
        this.setAccountCookie('false')
    }

    setAccountCookie = (value: string) => {
        // refresh this key
        this._hasAccountCookie = new Cookie('hasAccount')
        this._hasAccountCookie.set(value)
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
                setCookie(null, 'bk', unparsedJSON, { path: '/' })
                setCookie(null, 'displayName', statusJSON.displayName, { path: '/' })
                setCookie(null, 'postPub', statusJSON.post, { path: '/' })

                this.setAccountCookie('true')
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
}
