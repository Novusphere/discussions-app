import { computed, observable } from 'mobx'
import { MODAL_OPTIONS } from '@globals'
import { notification, message } from 'antd'

import baseImg from '@static/banners/default.png'

export class UIStore {
    @observable activeModal: MODAL_OPTIONS = MODAL_OPTIONS.none

    @observable currentIndex = 0
    @observable banners = [baseImg]

    @observable hideSidebar = false

    rotateBannerImage = () => {
        let index = this.currentIndex

        if (this.banners.length - 1 > index && typeof this.banners[index + 1] !== 'undefined') {
            index = index + 1
        }

        this.currentIndex = index
    }

    @computed get activeBanner() {
        return this.banners[this.currentIndex]
    }

    setSidebarHidden = (value: boolean) => {
        this.hideSidebar = value
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
