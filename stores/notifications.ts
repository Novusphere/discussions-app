import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, computed, observable, observe, reaction } from 'mobx'
import { task } from 'mobx-task'
import { getNewAuthStore, getTagStore, getUiStore, IStores } from '@stores/index'
import { discussions } from '@novuspherejs'
import { persist } from 'mobx-persist'
import NotificationModel from '@models/notificationModel'
import { computedFn } from 'mobx-utils'

export default class Notifications extends BaseStore {
    static notificationMaximumCount = 5

    // the time last checked
    @persist
    @observable
    lastCheckedNotifications = 0 // set default

    @persist('map')
    @observable
    watchingThread = observable.map<string, number>() // id: number

    @persist('map')
    @observable
    watchingThreadPostDiff = observable.map<string, number>() // how many new posts were there since watch began

    @observable notifications: NotificationModel[] = []
    @observable notificationTrayItems = observable.map<string, NotificationModel>() // max 5

    @observable postsPosition = {
        cursorId: undefined,
        count: 0,
    }

    // tray unread count
    @observable unreadCount = 0

    @observable firstTimePulling = true

    @observable private notificationIntervalHandler: any = null
    @observable private watchThreadIntervalHandler: any = null

    private readonly authStore: IStores['newAuthStore'] = getNewAuthStore()
    private readonly uiStore: IStores['uiStore'] = getUiStore()
    private readonly tagStore: IStores['tagStore'] = getTagStore()

    constructor() {
        super()

        reaction(
            () => this.authStore.hasAccount,
            hasAccount => {
                if (hasAccount) {
                    this.fetchNotificationsAsTray()
                    this.updateWatchThreadCount()

                    this.startNotificationInterval()
                } else {
                    this.destroyNotificationInterval()
                }
            }
        )

        observe(this.notificationTrayItems, change => {
            if (change.type === 'add') {
                this.unreadCount++
            }
        })

        observe(this.watchingThread, async change => {
            if (change.type === 'update') {
                const count = change.newValue - this.watchingThreadPostDiff.get(change.name)

                if (count > 0) {
                    const thread = await discussions.getThread(change.name)
                    const notificationModel = new NotificationModel({
                        type: 'watch',
                        post: {
                            ...thread.openingPost,
                            createdAt: new Date(Date.now()),
                            totalReplies: count,
                        },
                        tag: this.tagStore.tags.get(thread.openingPost.sub),
                    })

                    if (this.notificationTrayItems.size > 4) {
                        const [, , , , last] = Array.from(this.notificationTrayItems.keys())
                        this.notificationTrayItems.delete(last)
                    }

                    this.notificationTrayItems.set(thread.openingPost.uuid, notificationModel)
                }
            }
        })
    }

    public startNotificationInterval = () => {
        this.notificationIntervalHandler = setInterval(() => {
            this.fetchNotificationsAsTray()
            this.updateWatchThreadCount()
        }, 5000)
    }

    public destroyNotificationInterval = () => {
        if (this.notificationIntervalHandler) {
            clearInterval(this.notificationIntervalHandler)
            this.notificationIntervalHandler = null
        }
    }

    @action.bound
    async updateWatchThreadCount() {
        if (!this.watchingThread.size) return

        const threads = Array.from(this.watchingThread.keys())

        await threads.map(async thread => {
            const number = await discussions.getThreadReplyCount(thread)
            this.watchingThread.set(thread, number)
        })
    }

    @computed get notificationTrayItemsSorted() {
        return Array.from(this.notificationTrayItems.values()).sort((a, b) =>
            a.createdAt > b.createdAt ? -1 : 1
        )
    }

    @computed get hasNotifications() {
        return this.unreadCount > 0
    }

    @computed get notificationCount() {
        const count = this.unreadCount

        if (count > Notifications.notificationMaximumCount) {
            return `${Notifications.notificationMaximumCount}+`
        }

        return count
    }

    @action.bound
    setTimeStamp() {
        this.lastCheckedNotifications = Date.now()
    }

    @action.bound
    resetUnreadCount() {
        this.unreadCount = 0
    }

    @action.bound
    syncCountsForUnread() {
        this.watchingThreadPostDiff.merge(this.watchingThread)
    }

    @action.bound
    clearNotifications() {
        this.resetUnreadCount()
        this.notificationTrayItems.clear()
    }

    @task
    @action.bound
    async fetchNotifications(time, preCursorId, count, limit?) {
        try {
            const { payload, cursorId } = await discussions.getPostsForNotifications(
                this.authStore.activePublicKey,
                time,
                preCursorId,
                count,
                limit
            )

            return {
                payload,
                cursorId,
            }
        } catch (error) {
            throw error
        }
    }

    @task
    @action.bound
    async fetchNotificationsAsFeed() {
        try {
            const { payload, cursorId } = await this.fetchNotifications(
                0,
                this.postsPosition.cursorId,
                this.postsPosition.count
            )

            this.postsPosition = {
                cursorId,
                count: payload.length,
            }

            payload.forEach((item: any) => {
                this.notifications.push(item)
            })
        } catch (error) {
            throw error
        }
    }

    @task
    @action.bound
    async fetchNotificationsAsTray() {
        try {
            const { payload } = await this.fetchNotifications(
                this.lastCheckedNotifications,
                undefined,
                0,
                Notifications.notificationMaximumCount
            )

            payload.forEach(item => {
                this.notificationTrayItems.set(
                    item.uuid,
                    new NotificationModel({
                        type: 'mention',
                        post: item,
                        tag: this.tagStore.tags.get(item.sub),
                    })
                )
            })

            this.firstTimePulling= false
        } catch (error) {
            throw error
        }
    }

    @action.bound
    toggleThreadWatch(id: string, count: number) {
        if (this.watchingThread.has(id)) {
            this.watchingThread.delete(id)
            this.watchingThreadPostDiff.delete(id)
            return
        }

        if (this.watchingThread.size <= 4) {
            this.watchingThread.set(id, count)
            this.watchingThreadPostDiff.set(id, count)
            this.uiStore.showToast('Success! You are watching this thread', 'success')
        } else {
            this.uiStore.showToast('You can only watch a maximum of 5 threads', 'info')
        }
    }

    isWatchingThread = computedFn((id: string) => {
        return this.watchingThread.has(id)
    })
}

export const getNotificationsStore = getOrCreateStore('notificationsStore', Notifications)
