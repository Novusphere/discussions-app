import { action, computed, observable, observe } from 'mobx'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { persist } from 'mobx-persist'
import { computedFn } from 'mobx-utils'
import { getNotificationsStore, getTagStore, getUiStore, IStores } from '@stores/index'
import { discussions } from '@novuspherejs'
import NotificationModel from '@models/notificationModel'
import { checkIfNameIsValid, sleep } from '@utils'
import { task } from 'mobx-task'
import axios from 'axios'

export default class UserStore extends BaseStore {
    @persist('map') @observable following = observable.map<string, string>()
    @persist('map') @observable watching = observable.map<string, [number, number]>() // [currentCount, prevCount]
    @persist('map') @observable blockedUsers = observable.map<string, string>() // [pubKey, displayName]
    @persist('map') @observable blockedPosts = observable.map<string, string>() // [asPathURL, yyyydd]
    @persist('map') @observable delegated = observable.map<string, string>() // [name:pubKey:tagName, tagName]

    @observable
    blockedByDelegation = observable.map<string, string>() // either blockedUsers or blockedPosts

    @persist('object')
    @observable
    activeDelegatedTag = { value: '', label: '' }

    private readonly uiStore: IStores['uiStore'] = getUiStore()
    private readonly tagStore: IStores['tagStore'] = getTagStore()
    private readonly notificationsStore: IStores['notificationsStore'] = getNotificationsStore()

    constructor(props) {
        super(props)

        observe(this.watching, async change => {
            if (change.type === 'update') {
                const count = change.newValue[0] - change.newValue[1]

                if (count > 0) {
                    const thread = await discussions.getThread(change.name, '')
                    const notificationModel = new NotificationModel({
                        type: 'watch',
                        post: {
                            ...thread.openingPost,
                            totalReplies: count,
                        },
                        tag: this.tagStore.tags.get(thread.openingPost.sub),
                    })

                    if (this.notificationsStore.notificationTrayItems.size > 4) {
                        const [, , , , last] = Array.from(
                            this.notificationsStore.notificationTrayItems.keys()
                        )
                        this.notificationsStore.notificationTrayItems.delete(last)
                    }

                    this.notificationsStore.notificationTrayItems.set(
                        thread.openingPost.uuid,
                        notificationModel
                    )
                }
            }
        })

        this.notificationsStore.pingTheseMethods.push(this.updateWatchThreadCount)
    }

    @computed get activeDelegatedTagMembers() {
        if (!this.activeDelegatedTag) return []

        const keys = Array.from(this.delegated.keys())
        const values = Array.from(this.delegated.values())
        const names = []

        values.forEach((tagName, index) => {
            if (tagName !== this.activeDelegatedTag.value) return

            const accountNameWithPubKey = keys[index]
            if (names.indexOf(accountNameWithPubKey) === -1) {
                names.push(accountNameWithPubKey)
            }
        })

        return names
    }

    @action.bound
    private async validateAccountNameAndReturnMap(
        accountNameWithPubKey: string,
        map: string[]
    ): Promise<string[]> {
        let cache = map

        try {
            // validate the member
            const [name] = accountNameWithPubKey.split(':')
            const isValidAccountName = await checkIfNameIsValid(name)

            if (isValidAccountName) {
                cache.push(accountNameWithPubKey)
            }

            return cache
        } catch (error) {
            throw error
            // return error.message
        }
    }

    @action.bound
    async updateFromActiveDelegatedMembers() {
        try {
            return await Array.from(this.delegated.keys()).map(async delegatedMember => {
                const [, key] = delegatedMember.split(':')
                const { data } = await axios.get(
                    `https://atmosdb.novusphere.io/discussions/moderation/${key}`
                )

                if (data.hasOwnProperty('moderation')) {
                    const blockedPosts = data['moderation']['blockedPosts']
                    const blockedPostsKeys = Object.keys(blockedPosts)

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
        } catch (error) {
            throw error
        }
    }

    @action.bound
    private async setAndUpdateDelegatedPosts(mergedName: string, tagName: string) {
        console.log({
            mergedName,
            tagName,
        })

        if (!tagName || tagName === '') {
            this.uiStore.showToast(
                'An empty tag string is not valid. Set this user as a global mod by setting the tag to be "all".',
                'error'
            )
            return
        }

        this.delegated.set(mergedName, tagName)

        this.uiStore.showToast('Added user as a moderator', 'success')

        try {
            return await this.updateFromActiveDelegatedMembers()
        } catch (error) {
            return error
        }
    }

    @task.resolved({ swallow: true })
    @action.bound
    async setModerationMemberByTag(
        accountNameWithPubKey: string,
        tagName = this.activeDelegatedTag.value
    ) {
        const mergedName = `${accountNameWithPubKey}:${tagName}`

        try {
            if (this.delegated.has(mergedName)) {
                if (this.delegated.get(mergedName) === tagName) {
                    this.delegated.delete(mergedName)
                } else {
                    await this.setAndUpdateDelegatedPosts(mergedName, tagName)
                }
            } else {
                await this.setAndUpdateDelegatedPosts(mergedName, tagName)
            }
        } catch (error) {
            return error
        }
    }

    @action.bound
    setActiveDelegatedTag(option) {
        this.activeDelegatedTag = option
    }

    @computed get followingKeys() {
        return Array.from(this.following.keys())
    }

    @action.bound
    toggleUserFollowing(user: string, pub: string) {
        if (this.following.has(pub)) {
            this.following.delete(pub)
        } else {
            this.following.set(pub, user)
        }
    }

    isFollowingUser = computedFn((pub: string) => {
        return this.following.has(pub)
    }, true)

    @action.bound
    async updateWatchThreadCount() {
        if (!this.watching.size) return

        const threads = Array.from(this.watching.keys())

        await threads.map(async encodedThreadId => {
            const threadReplyCount = await discussions.getThreadReplyCount(encodedThreadId)

            let count = [threadReplyCount, threadReplyCount]

            if (this.isWatchingThread(encodedThreadId)) {
                const [, diff] = this.watching.get(encodedThreadId)
                count = [threadReplyCount, diff]
            }

            // @ts-ignore
            this.watching.set(encodedThreadId, count)
        })
    }

    @action.bound
    syncCountsForUnread() {
        this.watching.forEach(([curr, diff], encodedThread) => {
            this.watching.set(encodedThread, [curr, curr])
        })
    }

    @action.bound
    toggleThreadWatch(id: string, count: number) {
        if (this.watching.has(id)) {
            this.watching.delete(id)
            this.uiStore.showToast('You are no longer watching this thread', 'info')
            return
        }

        if (this.watching.size <= 4) {
            this.watching.set(id, [count, count])
            this.uiStore.showToast('Success! You are watching this thread', 'success')
        } else {
            this.uiStore.showToast('You can only watch a maximum of 5 threads', 'info')
        }
    }

    isWatchingThread = computedFn((id: string) => {
        return this.watching.has(id)
    })

    @action.bound
    toggleBlockUser(displayName: string, pubKey: string) {
        if (this.blockedUsers.has(pubKey)) {
            this.blockedUsers.delete(pubKey)
        } else {
            this.blockedUsers.set(pubKey, displayName)
        }
    }

    isUserBlocked = computedFn((pubKey: string) => {
        return this.blockedUsers.has(pubKey)
    })

    /**
     * @param {string} asPathURL - i.e. /tag/test/1hx6xdq9iwehn/testt
     */
    @action.bound
    toggleBlockPost(asPathURL: string) {
        if (this.blockedPosts.has(asPathURL)) {
            this.blockedPosts.delete(asPathURL)
            this.uiStore.showToast('This post has been unmarked as spam!', 'success')
        } else {
            const date = new Date(Date.now())
            const dateStamp = `${date.getFullYear()}${date.getMonth()}`
            this.blockedPosts.set(asPathURL, dateStamp)
            this.uiStore.showToast('This post has been marked as spam!', 'success')
        }
    }
}

export const getUserStore = getOrCreateStore('userStore', UserStore)
