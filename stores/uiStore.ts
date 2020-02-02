import { action, observable } from 'mobx'
import { RootStore } from '@stores'
import { MODAL_OPTIONS } from '@globals'

export class UIStore {
    @observable activeModal: MODAL_OPTIONS = MODAL_OPTIONS.none

    constructor(rootStore: RootStore) {}

    @action.bound
    setActiveModal(modal: MODAL_OPTIONS) {
        this.activeModal = modal
    }

    @action.bound
    clearActiveModal() {
        this.activeModal = MODAL_OPTIONS.none
    }
}
