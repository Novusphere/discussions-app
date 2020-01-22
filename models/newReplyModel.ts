import { Post } from '@novuspherejs'
import { action, computed, observable } from 'mobx'
import { getAuthStore, IStores } from '@stores'

export class NewReplyModel {
    @observable editing = false
    @observable open = false

    constructor(reply: Post) {
        console.log(this.editing)
    }

    @computed get canEditPost() {
        return false
    }

    @action.bound
    toggleEditing() {
        this.editing = !this.editing
    }

    @action.bound
    toggleOpen() {
        this.open = !this.open
    }
}
