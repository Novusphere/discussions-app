// Modified version of https://github.com/nghiepit/next-mobx-wrapper/tree/master/src

import { action } from 'mobx'
import { isServer } from '@utils'
import React from 'react'

const __NEXT_MOBX_STORE__ = new Map()

export const getKeyNameStore = fnName => fnName.replace(/^get(.)/, (match, p1) => p1.toLowerCase())

export const mapToJson = map => {
    try {
        return JSON.stringify([...map])
    } catch (e) {
        return map
    }
}

export const jsonToMap = jsonStr => {
    if (!jsonStr) {
        return jsonStr
    }

    try {
        return new Map(JSON.parse(jsonStr))
    } catch (e) {
        return jsonStr
    }
}

export class BaseStore {
    constructor(props = {}) {
        for (const prop in props) {
            // Convert JSON to Map
            this[prop] = jsonToMap(props[prop])
        }
    }

    @action
    update = (data = {}) => {
        for (const prop in data) {
            this[prop] = data[prop]
        }
    }
}

export const getOrCreateStore = (storeKeyName, Store) => initialState => {
    // Convert Map to JSON
    if (initialState) {
        for (const itemState in initialState) {
            try {
                const dataMap = initialState[itemState]

                if (dataMap.toJS() instanceof Map) {
                    initialState[itemState] = mapToJson(dataMap)
                }
            } catch (e) {}
        }
    }

    // Always make a new store if server
    if (isServer) {
        return new Store(initialState)
    }

    // Create store if unavailable on the client
    if (!__NEXT_MOBX_STORE__.has(storeKeyName)) {
        __NEXT_MOBX_STORE__.set(storeKeyName, new Store(initialState))
    }

    return __NEXT_MOBX_STORE__.get(storeKeyName)
}

export const withMobx = (getStores = {}) => App => {
    return class AppWithMobx extends React.Component<any> {
        private store: {}
        
        static async getInitialProps(appContext) {
            let appProps = {}

            // Provide the store to getInitialProps of pages
            appContext.ctx.store = {}
            for (const fnName in getStores) {
                const storeKeyName = getKeyNameStore(fnName)
                appContext.ctx.store[storeKeyName] = getStores[fnName]()
            }

            if (typeof App.getInitialProps === 'function') {
                appProps = await App.getInitialProps(appContext)
            }

            return {
                ...appProps,
                state: appContext.ctx.store,
            }
        }

        constructor(props) {
            super(props)
            this.store = {}

            for (const fnName in getStores) {
                const storeKeyName = getKeyNameStore(fnName)
                this.store[storeKeyName] = getStores[fnName](props.state[storeKeyName])
            }
        }

        render() {
            const { state, ...props } = this.props

            return <App {...props} store={{ ...this.store }} />
        }
    }
}
