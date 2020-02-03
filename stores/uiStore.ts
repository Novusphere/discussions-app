import { action, observable } from 'mobx'
import { MODAL_OPTIONS } from '@globals'
import { notification, message } from 'antd'
import { Router } from 'next/router'
import { RootStore } from '@stores'

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

    setActiveModal = (modal: MODAL_OPTIONS) => {
        this.activeModal = modal
    }

    clearActiveModal = () => {
        this.activeModal = MODAL_OPTIONS.none
    }

    showToast = (
        message: string,
        description: string,
        type = 'open',
        { btn, onClose } = { btn: null, onClose: null } as any
    ) => {
        notification[type]({
            message,
            description,
            btn,
            onClose,
        })
    }

    showMessage = (description: string, type = 'success') => {
        message[type](description)
    }
}
