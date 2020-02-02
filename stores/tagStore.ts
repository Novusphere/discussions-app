import { action, observable } from 'mobx'
import { RootStore } from '@stores/index'

export class TagStore {
    @observable
    subscribed = observable.set(['uxfyre', 'test'])

    constructor(rootStore: RootStore) {}

    @action.bound
    addTagToSubscribed(tagName: string) {
        this.subscribed.add(tagName)
    }
}
