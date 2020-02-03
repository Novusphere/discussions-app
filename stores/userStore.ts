import { persist } from 'mobx-persist'
import { observable } from 'mobx'
import { RootStore } from '@stores/index'
import axios from 'axios'
import _ from 'lodash'

export class UserStore {
    @persist('map') following = observable.map<string, string>()
    @persist('map') watching = observable.map<string, [number, number]>() // [currentCount, prevCount]
    @persist('map') blockedUsers = observable.map<string, string>() // [pubKey, displayName]
    @persist('map') blockedPosts = observable.map<string, string>() // [asPathURL, yyyydd]
    @persist('map') delegated = observable.map<string, string>() // [name:pubKey:tagName, tagName]
    @persist('map') pinnedPosts = observable.map<string, string>() // [asPathURL, tagName]

    blockedByDelegation = observable.map<string, string>() // either blockedUsers or blockedPosts

    @persist('map') pinnedByDelegation = observable.map<string, string>() // [asPathURL, tagName]
    @persist('object') @observable activeDelegatedTag = { value: '', label: '' }

    @observable followingKeys = []

    @observable private uiStore: RootStore['uiStore']

    constructor(rootStore: RootStore) {
        this.uiStore = rootStore.uiStore
    }

    hydrate(initialState: any = {}) {
        if (initialState.followingKeys) {
            this.followingKeys = initialState.followingKeys
        }
    }

    private async setAndUpdateDelegatedPosts(
        mergedName: string,
        tagName: string,
        suppressAlert = false
    ) {
        if (!suppressAlert) {
            if (!tagName || tagName === '') {
                this.uiStore.showToast(
                    'An empty tag string is not valid. Set this user as a global mod by setting the tag to be "all".',
                    'error'
                )
                return
            }
        }

        this.delegated.set(mergedName, tagName)

        if (!suppressAlert) {
            this.uiStore.showToast('Added user as a moderator', 'success')
        }

        try {
            return await this.updateFromActiveDelegatedMembers()
        } catch (error) {
            return error
        }
    }

    async setPinnedPosts(posts: any[], delegated = false) {
        const obj = {}

        _.forEach(posts, (urls, name: string) => {
            _.forEach(urls, url => {
                Object.assign(obj, {
                    [url]: name,
                })
            })
        })

        if (delegated) {
            this.pinnedByDelegation.replace(obj)
        } else {
            this.pinnedPosts.replace(obj)
        }
    }

    async updateFromActiveDelegatedMembers() {
        try {
            return await Promise.all(
                [...this.delegated.keys()].map(async delegatedMember => {
                    const [, key] = delegatedMember.split(':')
                    const { data } = await axios.get(
                        `https://atmosdb.novusphere.io/discussions/moderation/${key}`
                    )

                    if (data.hasOwnProperty('moderation')) {
                        const blockedPosts = data['moderation']['blockedPosts']
                        const pinnedPosts = data['moderation']['pinnedPosts']
                        const blockedPostsKeys = Object.keys(blockedPosts)

                        if (pinnedPosts) {
                            this.setPinnedPosts(pinnedPosts, true)
                        }

                        if (blockedPostsKeys.length) {
                            blockedPostsKeys.forEach(datestamp => {
                                const blockedPostForDateStamp: string[] = blockedPosts[datestamp]
                                if (blockedPostForDateStamp.length) {
                                    blockedPostForDateStamp.forEach(blockedPost => {
                                        if (this.blockedByDelegation)
                                            this.blockedByDelegation.set(blockedPost, datestamp)
                                    })
                                }
                            })
                        }
                    }
                })
            )
        } catch (error) {
            throw error
        }
    }

    async setModerationMemberByTag(
        accountNameWithPubKey: string,
        tagName = this.activeDelegatedTag.value,
        suppressAlert = false,
        override = false
    ) {
        const mergedName = `${accountNameWithPubKey}:${tagName}`

        try {
            if (override) {
                return await this.setAndUpdateDelegatedPosts(mergedName, tagName, suppressAlert)
            }

            if (this.delegated.has(mergedName)) {
                if (this.delegated.get(mergedName) === tagName) {
                    this.delegated.delete(mergedName)
                } else {
                    await this.setAndUpdateDelegatedPosts(mergedName, tagName, suppressAlert)
                }
            } else {
                await this.setAndUpdateDelegatedPosts(mergedName, tagName, suppressAlert)
            }
        } catch (error) {
            return error
        }
    }
}
