import { action, computed, observable } from 'mobx'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { toast } from 'react-toastify'
import { Router } from 'next/router'

export default class UiStore extends BaseStore {
    @observable activeBanner = '/static/banners/default.png'
    @observable activeModal = ''

    @observable showSidebar = true
    @observable showBanner = true

    @observable currentIndex = 0
    @observable banners = ['/static/banners/default.png']

    @observable isServer = true

    constructor() {
        super()

        Router.events.on('routeChangeStart', url => {
            if (url.indexOf('tag') === -1) {
                let index = this.currentIndex

                if (
                    this.banners.length - 1 > index &&
                    typeof this.banners[index + 1] !== 'undefined'
                ) {
                    index = index + 1
                }

                this.activeBanner = this.banners[index]
                this.currentIndex = index
            }
        })
    }

    @action.bound
    toggleSidebarStatus(status: boolean) {
        this.showSidebar = status
    }

    @action.bound
    toggleBannerStatus(status: boolean) {
        this.showBanner = status
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

    showToast = (
        message: string,
        type: 'error' | 'info' | 'success' | 'warn',
        onClick = undefined
    ) => {
        return toast[type](message, {
            hideProgressBar: true,
            pauseOnHover: false,
            onClick,
        })
    }
}

export const getUiStore = getOrCreateStore('uiStore', UiStore)
