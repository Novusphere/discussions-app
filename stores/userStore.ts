import { observable, action, computed, observe } from 'mobx'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { persist } from 'mobx-persist'
import { computedFn } from 'mobx-utils'
import { getNotificationsStore, getTagStore, getUiStore, IStores } from '@stores/index'
import { discussions } from '@novuspherejs'
import NotificationModel from '@models/notificationModel'

export default class UserStore extends BaseStore {
    /**
     * Observable map of users the current account is following
     * TODO: Sync with an API
     * {
     *     pub: username
     * }
     */
    @persist('map') @observable following = observable.map<string, string>()

    @persist('map') @observable watching = observable.map<string, [number, number]>() // [currentCount, prevCount]

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

        setInterval(() => this.updateWatchThreadCount(), 2000)
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
}

export const getUserStore = getOrCreateStore('userStore', UserStore)
