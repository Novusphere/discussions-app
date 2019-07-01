import { action, computed, extendObservable, observable } from 'mobx'

const defaultState = {
    activeBanner: 'test',
}

export default class Ui {
    @observable activeBanner = '123'
    @observable activeModal = ''

    constructor(UI = null) {
        extendObservable(this, UI || defaultState)
    }

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
