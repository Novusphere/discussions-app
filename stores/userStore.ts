import { observable, action, computed, observe } from 'mobx'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { persist } from 'mobx-persist'
import { computedFn } from 'mobx-utils'
import { getNotificationsStore, getTagStore, getUiStore, IStores } from '@stores/index'
import { discussions } from '@novuspherejs'
import NotificationModel from '@models/notificationModel'
import { checkIfNameIsValid } from '@utils'
import { task } from 'mobx-task'

export default class UserStore extends BaseStore {
    @persist('map') @observable following = observable.map<string, string>()
    @persist('map') @observable watching = observable.map<string, [number, number]>() // [currentCount, prevCount]
    @persist('map') @observable blockedUsers = observable.map<string, string>() // [pubKey, displayName]
    @persist('map') @observable blockedPosts = observable.map<string, string>() // [asPathURL, yyyydd]
    @persist('map') @observable delegated = observable.map<string, string[]>() // [tagName, string[]]

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
                    const thread = await discussions.getThread('3qk3dk57g39v1')
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
        if (!this.delegated.has(this.activeDelegatedTag.value)) return []
        return this.delegated.get(this.activeDelegatedTag.value)
    }

    @action.bound
    private async validateAccountNameAndReturnMap(
        accountName: string,
        map: string[]
    ): Promise<string[]> {
        let cache = map

        try {
            // validate the member
            const isValidAccountName = await checkIfNameIsValid(accountName)

            if (isValidAccountName) {
                cache.push(accountName)
            }

            return cache
        } catch (error) {
            throw error
            // return error.message
        }
    }

    @task.resolved({ swallow: true })
    @action.bound
    async setModerationMemberByTag(accountName: string, tagName = this.activeDelegatedTag.value) {
        try {
            if (this.delegated.has(tagName)) {
                let members = this.delegated.get(tagName)
                const index = members.indexOf(accountName)

                if (index !== -1) {
                    members.splice(index, 1)
                } else {
                    members = await this.validateAccountNameAndReturnMap(accountName, members)
                }

                this.delegated.set(tagName, members)
            } else {
                const members = await this.validateAccountNameAndReturnMap(accountName, [])
                this.delegated.set(tagName, members)
            }
        } catch (error) {
            throw error
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
        } else {
            const date = new Date(Date.now())
            const dateStamp = `${date.getFullYear()}${date.getMonth()}`
            this.blockedPosts.set(asPathURL, dateStamp)
        }
    }
}

export const getUserStore = getOrCreateStore('userStore', UserStore)
