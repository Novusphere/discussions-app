import { action, computed, intercept, observable, observe, reaction } from 'mobx'
import { TagModel } from '@models/tagModel'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { task } from 'mobx-task'
import { persist } from 'mobx-persist'
import { defaultSubs, sleep } from '@utils'
import { discussions } from '@novuspherejs'

export default class Tag extends BaseStore {
    // the amount of subs that are base
    static baseSubLength = 3

    @observable activeTag: TagModel = null
    @observable tags = observable.map<string, TagModel>()

    @persist('map') @observable subSubscriptionStatus = observable.map<string, boolean>()

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
            this.subSubscriptionStatus.set(tagName, true)
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
    public toggleTagSubscribe(tag: string) {
        if (this.subSubscriptionStatus.has(tag)) {
            this.subSubscriptionStatus.set(tag, !this.subSubscriptionStatus.get(tag))
        }
    }

    @action.bound
    public destroyActiveTag() {
        this.activeTag = null
    }

    @task
    public setActiveTag(tagName: string): TagModel {
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
