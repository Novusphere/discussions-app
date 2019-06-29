import { action, observable } from 'mobx'
import BaseModel from './baseModel'

interface TagOptions {
    root: boolean
    url: string
}

export class TagModel extends BaseModel {
    @observable name = ''
    @observable icon = ''
    @observable active = false
    @observable root = false
    @observable url = ''

    constructor(tag, icon, opts?: TagOptions) {
        super()
        this.id = BaseModel.generateId()
        this.name = tag.name
        this.url = tag.url
        this.icon = icon

        if (opts && opts.url) {
            this.url = opts.url
        }

        if (opts) {
            Object.keys(opts).forEach(opt => {
                this[opt] = opts[opt]
            })
        }
    }

    @action setActive = () => {
        this.active = !this.active
    }
}
