import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, computed, observable, reaction } from 'mobx'
import { task } from 'mobx-task'
import { getNewAuthStore, IStores } from '@stores/index'
import { discussions } from '@novuspherejs'
import { persist } from 'mobx-persist'
import { IPost } from '@stores/posts'
import FeedModel from '@models/feedModel'
import { sleep } from '@utils'

export default class Notifications extends BaseStore {
    static notificationMaximumCount = 5

    // the time last checked
    @persist
    @observable
    lastCheckedNotifications = -1 // set default

    @observable cursorId = 0
    @observable notifications = observable.map<string, IPost>()
    @observable unreadCount = 0

    private readonly authStore: IStores['newAuthStore'] = getNewAuthStore()

    constructor() {
        super()

        reaction(
            () => this.authStore.hasAccount,
            hasAccount => {
                if (hasAccount) {
                    this.fetchNotifications()
                }
            },
            {
                fireImmediately: true,
            }
        )
    }

    @computed get notificationsAsArray() {
        return Array.from(this.notifications.values())
    }

    @computed get firstSetOfNotifications() {
        return this.notificationsAsArray.slice(0, Notifications.notificationMaximumCount - 1)
    }

    @computed get hasMoreThanQueriedNotifications() {
        return this.cursorId !== 0
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
    clearNotifications() {
        this.resetUnreadCount()
        this.notifications.clear()
        this.cursorId = 0
    }

    @task
    @action.bound
    async fetchNotifications(time = this.lastCheckedNotifications) {
        let defaultCursorId = this.cursorId

        if (defaultCursorId === 0) {
            defaultCursorId = undefined
        }

        try {
            const { payload, cursorId } = await discussions.getPostsForNotifications(
                this.authStore.activePublicKey,
                time,
                defaultCursorId
            )

            if (time === 0) {
                this.lastCheckedNotifications = Date.now()
                this.cursorId = cursorId
                return payload
            } else {
                payload.forEach(notification => {
                    this.notifications.set(notification.uuid, notification as any)
                })

                this.lastCheckedNotifications = Date.now()
                this.cursorId = cursorId
                this.unreadCount = this.notifications.size
            }

            return payload
        } catch (error) {
            throw error
        }
    }

    @task
    @action.bound
    async fetchNotificationsAsFeed(): Promise<FeedModel[]> {
        try {
            await sleep(500)
            const payload = await this.fetchNotifications(0)
            return payload.map(post => new FeedModel(post as any))
        } catch (error) {
            throw error
        }
    }
}

export const getNotificationsStore = getOrCreateStore('notificationsStore', Notifications)
