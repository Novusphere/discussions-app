import { action, computed, observable } from 'mobx'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { toast } from 'react-toastify'

export default class Ui extends BaseStore {
    @observable activeBanner = '/static/banners/default.png'
    @observable activeModal = ''

    @observable showSidebar = true
    @observable showBanner = true

    @action.bound
    toggleSidebarAndBanner() {
        this.showSidebar = !this.showSidebar
        this.showBanner = !this.showBanner
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

    showToast = (message: string, type: 'error' | 'info' | 'success' | 'warn') => {
        return toast[type](message)
    }

    hideToast = (toastId?: number) => {
        return toast.dismiss(toastId)
    }
}

export const getUiStore = getOrCreateStore('uiStore', Ui)
