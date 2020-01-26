import { action, observable } from 'mobx'
import BaseModel from './baseModel'

interface TagOptions {
    root: boolean
    url: string
}

export class TagModel extends BaseModel {
    @observable name = ''
    @observable icon = ''
    @observable root = false
    @observable url = ''

    @observable memberCount = undefined
    @observable tagDescription = undefined

    constructor(tag, opts?: TagOptions) {
        super()
        this.id = BaseModel.generateId()
        this.name = tag.name
        this.url = tag.url
        this.icon = tag.logo

        if (tag.hasOwnProperty('tagDescription')) {
            this.tagDescription = tag.tagDescription
        }

        if (tag.hasOwnProperty('memberCount')) {
            this.memberCount = tag.memberCount
        }

        if (opts && opts.url) {
            this.url = opts.url
        }

        if (opts) {
            Object.keys(opts).forEach(opt => {
                this[opt] = opts[opt]
            })
        }
    }
}
