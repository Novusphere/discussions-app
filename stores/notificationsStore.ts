import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, computed, observable, observe, reaction } from 'mobx'
import { task } from 'mobx-task'
import { getAuthStore, getTagStore, getUiStore, IStores } from '@stores/index'
import { discussions } from '@novuspherejs'
import { persist } from 'mobx-persist'
import NotificationModel from '@models/notificationModel'
import { computedFn } from 'mobx-utils'
import { IPost } from '@stores/postsStore'

export default class NotificationsStore extends BaseStore {
    static notificationMaximumCount = 5

    // the time last checked
    @persist
    @observable
    lastCheckedNotifications = 0 // set default

    // @persist('map')
    // @observable
    // watchingThread = observable.map<string, number>() // id: number
    //
    // @persist('map')
    // @observable
    // watchingThreadPostDiff = observable.map<string, number>() // how many new posts were there since watch began

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

    private readonly authStore: IStores['authStore'] = getAuthStore()
    private readonly uiStore: IStores['uiStore'] = getUiStore()
    private readonly tagStore: IStores['tagStore'] = getTagStore()

    constructor() {
        super()

        reaction(
            () => this.authStore.hasAccount,
            hasAccount => {
                if (hasAccount) {
                    this.fetchNotificationsAsTray()
                    // this.updateWatchThreadCount()

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

    }

    public startNotificationInterval = () => {
        this.notificationIntervalHandler = setInterval(() => {
            this.fetchNotificationsAsTray()
            // this.updateWatchThreadCount()
        }, 20000)
    }

    public destroyNotificationInterval = () => {
        if (this.notificationIntervalHandler) {
            clearInterval(this.notificationIntervalHandler)
            this.notificationIntervalHandler = null
        }
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

        if (count > NotificationsStore.notificationMaximumCount) {
            return `${NotificationsStore.notificationMaximumCount}+`
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
    clearNotifications() {
        this.resetUnreadCount()
        this.notificationTrayItems.clear()
    }

    @action.bound
    clearNotification(id) {
        this.notificationTrayItems.delete(id)
    }

    @task
    @action.bound
    async fetchNotifications(
        time,
        preCursorId,
        count,
        limit?
    ): Promise<{
        payload: IPost[]
        cursorId: number
    }> {
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
                const model = new NotificationModel({
                    type: 'mention',
                    post: item,
                    tag: this.tagStore.tags.get(item.sub),
                })
                this.notifications.push(model)
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
                NotificationsStore.notificationMaximumCount
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

            this.firstTimePulling = false
        } catch (error) {
            throw error
        }
    }
}

export const getNotificationsStore = getOrCreateStore('notificationsStore', NotificationsStore)
