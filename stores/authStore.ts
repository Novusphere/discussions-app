import { action, computed, observable } from 'mobx'
import { SIGN_IN_OPTIONS } from '@globals'
import { RootStore } from '@stores'
import { bkToStatusJson } from '@utils'
import { discussions } from '@novuspherejs'
import { setCookie } from 'nookies'
import Cookie from 'mobx-cookie'

export class AuthStore {
    _hasAccountCookie = new Cookie('hasAccount')
    _postPubKey = new Cookie('postPub')

    @observable
    preferredSignInMethod: SIGN_IN_OPTIONS = SIGN_IN_OPTIONS.brainKey

    @observable
    displayName = ''

    @observable
    uidwWalletPubKey = ''

    @observable
    postPriv = ''

    @observable
    hasEOSWallet = false

    @observable supportedTokensForUnifiedWallet = []
    @observable supportedTokensImages: { [symbol: string]: string } = {}

    constructor(rootStore: RootStore) {}

    @computed get hasAccount() {
        return JSON.parse(this._hasAccountCookie.value)
    }

    @computed get postPub() {
        return this._postPubKey.value
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
        console.log(this.hasAccount)
        // refresh this key
        this._hasAccountCookie = new Cookie('hasAccount')
        this._hasAccountCookie.set(value)
        console.log(this.hasAccount)
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

                this.setAccountCookie('true')

                this.storeKeys(brianKeyVerify)
            }
        } catch (error) {
            throw error
        }
    }
}
