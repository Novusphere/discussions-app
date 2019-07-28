import { action, computed, observable } from 'mobx'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'

export default class Ui extends BaseStore {
    @observable activeBanner = '/static/banners/default.png'
    @observable activeModal = ''

    @computed get isModalOpen(): boolean {
        return this.activeModal !== ''
    }

    @action showModal = modal => {
        this.activeModal = modal
    }

    @action hideModal = () => {
        this.activeModal = ''
    }
}

export const getUiStore = getOrCreateStore('uiStore', Ui)
