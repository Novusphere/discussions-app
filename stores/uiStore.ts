import { action, observable } from 'mobx'
import { RootStore } from '@stores'
import { MODAL_OPTIONS } from '@globals'
import { notification } from 'antd'
import { Router } from 'next/router'

export class UIStore {
    @observable activeModal: MODAL_OPTIONS = MODAL_OPTIONS.none

    @observable currentIndex = 0
    @observable banners = ['/static/banners/default.png']
    @observable activeBanner = this.banners[this.currentIndex]

    constructor(rootStore: RootStore) {
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
    setActiveModal(modal: MODAL_OPTIONS) {
        this.activeModal = modal
    }

    @action.bound
    clearActiveModal() {
        this.activeModal = MODAL_OPTIONS.none
    }

    showToast = (message: string, description: string, type = 'open') => {
        notification[type]({
            message,
            description,
        })
    }
}
