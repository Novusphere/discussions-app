import { action, computed, observable } from 'mobx'
import { TagModel } from '@models/tagModel'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { task } from 'mobx-task'
import { persist } from 'mobx-persist'
import { defaultSubs } from '@utils'
import { discussions } from '@novuspherejs'

export default class Tag extends BaseStore {
    // the amount of subs that are base
    static baseSubLength = 3

    @observable postsPosition = {
        count: 0,
        cursorId: undefined,
    }

    @observable allPosts: any[] = []

    @observable activeTag: TagModel = null
    @observable tags = observable.map<string, TagModel>()

    @persist('map') @observable subSubscriptionStatus = observable.map<string, boolean>()

    constructor() {
        super()

        // set top level tags
        this.setTopLevelTags()
    }

    @task
    @action.bound
    async getPostsBySubscribed() {
        try {
            const { posts, cursorId } = await discussions.getPostsForSubs(
                this.subscribedSubs,
                this.postsPosition.cursorId,
                this.postsPosition.count
            )


            this.allPosts = [...this.allPosts, ...posts]
            this.postsPosition = {
                cursorId,
                count: this.allPosts.length,
            }

            return this.allPosts
        } catch (error) {
            return error
        }
    }

    @action.bound
    initializeDefaultSubs() {
        // hard code tags
        if (this.tags.size === Tag.baseSubLength) {
            defaultSubs.map(tag => {
                this.tags.set(tag.name, new TagModel(tag))
                this.subSubscriptionStatus.set(tag.name, true)
            })
        }
    }

    @computed get subscribedSubs() {
        const subs = []

        this.subSubscriptionStatus.forEach((subStatus, subName) => {
            if (this.subSubscriptionStatus.get(subName)) {
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
