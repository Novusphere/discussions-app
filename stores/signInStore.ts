import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'

export default class SignInStore extends BaseStore {

}

export const getSignInStore = getOrCreateStore('signInStore', SignInStore)
