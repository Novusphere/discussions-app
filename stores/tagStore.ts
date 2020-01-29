import { action, observable } from 'mobx'
import { TagModel } from '@models/tagModel'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { persist } from 'mobx-persist'
import { defaultSubs } from '@utils'
import { getUiStore, IStores } from '@stores/index'
import { faHome, faListAlt, faNewspaper } from '@fortawesome/free-solid-svg-icons'
import { computedFn } from 'mobx-utils'

export default class TagStore extends BaseStore {
    // the amount of subs that are base
    static baseSubLength = 3

    private readonly uiStore: IStores['uiStore'] = getUiStore()

    @observable activeTag: TagModel = null
    @observable activeSlug = ''

    tags = observable.map<string, TagModel>()
    tagGroup = observable.map<string, string[]>()

    @persist('list')
    @observable
    subSubscriptionStatus = []

    @observable requiresSync = false

    constructor() {
        super()

        // set top level tags
        this.setTopLevelTags()

        // hard code tags
        // this.initializeDefaultSubs()

        // subscribe everyone to default
        // this.subscribeToDefaultSubs()
    }

    @action.bound
    setTagGroup(groupName: string, tags: string[]) {
        if (!this.tagGroup.has(groupName)) {
            this.tagGroup.set(groupName, tags)
        }
    }

    @action.bound
    initializeDefaultSubs() {
        if (this.tags.size === TagStore.baseSubLength) {
            defaultSubs.map(tag => {
                this.tags.set(tag.name, new TagModel(tag))
            })
        }
    }

    @action.bound
    async subscribeToDefaultSubs() {
        this.tags.forEach((tagStatus, tagName) => {
            this.subSubscriptionStatus.push(tagName)
        })

        return Promise.resolve(true)
    }

    @action.bound
    private getGenericTag(subName: string) {
        return new TagModel({
            name: subName,
            logo: 'https://cdn.novusphere.io/static/atmos.svg',
            url: `/tag/${subName}`,
        })
    }

    tagModelFromObservables = (name) => {
        if (name === '') return null

        if (this.tags.has(name)) {
            return this.tags.get(name)
        }

        return this.getGenericTag(name)
    }

    @action.bound
    addTag(tagName: string, cb?: any) {
        if (this.subSubscriptionStatus.indexOf(tagName) === -1) {
            this.requiresSync = true
            this.subSubscriptionStatus.unshift(tagName)
            this.uiStore.showToast(`You have subbed to ${tagName}`, 'success')
            this.requiresSync = false
            if (cb) cb()
        }
    }

    @action.bound
    public toggleTagSubscribe(tag: string) {
        this.requiresSync = true
        if (this.subSubscriptionStatus.indexOf(tag) !== -1) {
            this.subSubscriptionStatus.splice(this.subSubscriptionStatus.indexOf(tag), 1)
        } else {
            this.subSubscriptionStatus.unshift(tag)
        }
        this.requiresSync = false
    }

    @action.bound
    public destroyActiveTag() {
        this.activeTag = null
        this.activeSlug = ''
    }

    @action.bound
    setActiveSlug(slug: string) {
        this.activeSlug = slug
    }

    @action.bound
    public setActiveTag(tagName: string): TagModel {
        let model = null

        if (this.tags.has(tagName)) {
            model = this.tags.get(tagName)
        } else {
            model = this.getGenericTag(tagName)
        }

        this.activeTag = model

        return model
        // if (!this.tags.has(tagName)) {
        //     this.activeTag = this.getGenericTag(tagName)
        // } else if (this.tags.has(tagName)) {
        //     this.activeTag = this.tags.get(tagName)
        // } else {
        //     if (defaultSubs.some(defaultSub => defaultSub.name === tagName)) {
        //         let tagModel
        //
        //         if (!this.tags.get(tagName)) {
        //             tagModel = new TagModel(tagName)
        //             this.tags.set(tagName, tagModel)
        //         } else {
        //             tagModel = this.tags.get(tagName)
        //         }
        //
        //         this.activeTag = tagModel
        //         return tagModel
        //     }
        // }
        //
        // return null
    }

    private setTopLevelTags = () => {
        ;[
            {
                name: 'home',
                url: '/',
                logo: faHome,
            },
            {
                name: 'feed',
                url: '/feed',
                logo: faListAlt,
            },
            {
                name: 'all',
                url: '/all',
                logo: faNewspaper,
            },
        ].map(topLevelTag => {
            this.tags.set(
                topLevelTag.name,
                new TagModel(topLevelTag, {
                    root: true,
                    url: topLevelTag.url,
                })
            )
        })
    }
}

export const getTagStore = getOrCreateStore('tagStore', TagStore)
