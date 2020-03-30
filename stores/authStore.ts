import { action, observable } from 'mobx'
import { SIGN_IN_OPTIONS } from '@globals'
import { RootStore } from '@stores'
import { bkToStatusJson } from '@utils'
import { discussions, init, eos } from '@novuspherejs'
import { task } from 'mobx-task'
import { notification } from 'antd'
import { persist } from 'mobx-persist'

export class AuthStore {
    @persist('object')
    @observable
    bk: any = null

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
    @observable TEMP_TippingTransfers = [
        {
            "symbol": "ATMOS",
            "token": {
                "label": "ATMOS",
                "value": "novusphereio",
                "contract": "nsuidcntract",
                "chain": 0,
                "decimals": 3,
                "fee": {
                    "flat": 0,
                    "percent": 0.001
                },
                "min": 1
            },
            "chain": 0,
            "to": "EOS8AgDT1hFD699511kaoPAXSpvqMJrngAnqG2JsxEdWUEDLcAC4s",
            "amount": "0.999 ATMOS",
            "fee": "0.001 ATMOS",
            "nonce": 1585590097309,
            "memo": "",
            "username": "xiaxiaxia"
        },
        {
            "symbol": "ATMOS",
            "token": {
                "label": "ATMOS",
                "value": "novusphereio",
                "contract": "nsuidcntract",
                "chain": 0,
                "decimals": 3,
                "fee": {
                    "flat": 0,
                    "percent": 0.001
                },
                "min": 1
            },
            "chain": 0,
            "to": "EOS5i7VWYsBNhfaAVfMSBbWCkPFYbbZF8nAEGQF685jRDrAfeWVVL",
            "amount": "0.999 ATMOS",
            "fee": "0.001 ATMOS",
            "nonce": 1585590097309,
            "memo": "",
            "username": "Raining\_ATMOS"
        }
    ]

    constructor(rootStore: RootStore) {}

    @action.bound
    setTEMPPrivateKey = (key: string) => {
        this.TEMP_WalletPrivateKey = key
    }

    @action.bound
    setTEMPTransfers(transfers: any[]) {
        this.TEMP_TippingTransfers = transfers
    }

    @action.bound
    clearTEMPVariables() {
        this.TEMP_TippingTransfers = []
        this.TEMP_WalletPrivateKey = ''
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
            this.setUidWalletKey(keys.uidwallet.pub)
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
        this.setHasAccount(false)
        this.postPub = ''
        this.postPriv = ''
        this.accountPubKey = ''
        this.accountPrivKey = ''
        this.uidwWalletPubKey = ''
    }

    setUidWalletKey = (value: string) => {
        this.uidwWalletPubKey = value
    }

    setAccountKey = ({ pub, priv }: { pub: string; priv: string }) => {
        this.accountPrivKey = priv
        this.accountPubKey = pub
    }

    setHasAccount = (value: boolean) => {
        this.hasAccount = value
    }

    setHasEOSWallet = (value: boolean) => {
        this.hasEOSWallet = value
    }

    setBK = (value: string) => {
        this.bk = value
    }

    setPostPub = (value: string) => {
        this.postPub = value
    }

    setDisplayName = (value: string) => {
        this.displayName = value
    }

    signInWithBK = async (brianKeyVerify: string, displayName: string, password: string) => {
        try {
            const bkIsValid = discussions.bkIsValid(brianKeyVerify)

            if (!bkIsValid) {
                throw new Error('You have entered an invalid brain key')
            }

            const unparsedJSON = await bkToStatusJson(brianKeyVerify, displayName, password, null)

            if (unparsedJSON) {
                const statusJSON = JSON.parse(unparsedJSON)
                this.setDisplayName(statusJSON.displayName)
                this.setBK(unparsedJSON)
                this.setPostPub(statusJSON.post)
                this.setHasAccount(true)
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
                this.setHasEOSWallet(false)
                notification.success({
                    message: 'Success',
                    description: 'You have disconnected your EOS wallet',
                })
            } else {
                const wallet = await this.initializeScatterLogin()

                if (wallet && wallet.connected) {
                    this.eosWalletDisplayName = wallet.auth.accountName
                    ;(wallet as any).connect()
                    this.setHasEOSWallet(true)
                } else {
                    this.setHasEOSWallet(false)
                }
            }
        } catch (error) {
            throw error
        }
    })
}
