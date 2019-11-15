import { action, computed, observable } from 'mobx'
import { TagModel } from '@models/tagModel'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { task } from 'mobx-task'
import { persist } from 'mobx-persist'
import { defaultSubs } from '@utils'
import { getUiStore, IStores } from '@stores/index'

export default class Tag extends BaseStore {
    // the amount of subs that are base
    static baseSubLength = 3

    private readonly uiStore: IStores['uiStore'] = getUiStore()

    @observable activeTag: TagModel = null
    @observable tags = observable.map<string, TagModel>()

    @persist('list') @observable subSubscriptionStatus: string[] = []

    constructor() {
        super()

        // set top level tags
        this.setTopLevelTags()

        // hard code tags
        this.initializeDefaultSubs()

        // subscribe everyone to default
        this.subscribeToDefaultSubs()
    }

    @action.bound
    initializeDefaultSubs() {
        if (this.tags.size === Tag.baseSubLength) {
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

    @computed get subscribedSubs() {
        const subs = []

        this.subSubscriptionStatus.forEach((subStatus, subName) => {
            if (subStatus) {
                subs.push(subName)
            }
        })

        return subs
    }

    @action.bound
    private getGenericTag(subName: string) {
        return new TagModel({
            name: subName,
            logo: 'https://cdn.novusphere.io/static/atmos.svg',
            url: `/tag/${subName}`,
        })
    }

    @computed get subscribedSubsAsModels() {
        const subs = []

        this.subSubscriptionStatus.forEach(subName => {
            if (this.tags.has(subName)) {
                subs.push(this.tags.get(subName))
            } else {
                const model = this.getGenericTag(subName)
                subs.push(model)
            }
        })

        return subs
    }

    @action.bound
    addTag(tagName: string) {
        if (this.subSubscriptionStatus.indexOf(tagName) === -1) {
            this.subSubscriptionStatus.unshift(tagName)
            this.uiStore.showToast(`You have subbed to ${tagName}`, 'success')
        }
    }

    @action.bound
    public toggleTagSubscribe(tag: string) {
        if (this.subSubscriptionStatus.indexOf(tag) !== -1) {
            this.subSubscriptionStatus.splice(this.subSubscriptionStatus.indexOf(tag), 1)
        } else {
            this.subSubscriptionStatus.unshift(tag)
        }
    }

    @action.bound
    public destroyActiveTag() {
        this.activeTag = null
    }

    @task
    public setActiveTag(tagName: string): TagModel {
        if (!this.tags.has(tagName)) {
            this.activeTag = this.getGenericTag(tagName)
        } else {
            if (defaultSubs.some(defaultSub => defaultSub.name === tagName)) {
                let tagModel

                if (!this.tags.get(tagName)) {
                    tagModel = new TagModel(tagName)
                    this.tags.set(tagName, tagModel)
                } else {
                    tagModel = this.tags.get(tagName)
                }

                this.activeTag = tagModel
                return tagModel
            }
        }

        return null
    }

    private setTopLevelTags = () => {
        ;[
            {
                name: 'home',
                url: '/',
            },
            {
                name: 'feed',
                url: '/feed',
            },
            {
                name: 'all',
                url: '/all',
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

export const getTagStore = getOrCreateStore('tagStore', Tag)
