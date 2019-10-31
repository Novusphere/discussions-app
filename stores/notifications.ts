import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, computed, observable, reaction } from 'mobx'
import { task } from 'mobx-task'
import { getNewAuthStore, IStores } from '@stores/index'
import { discussions } from '@novuspherejs'
import { persist } from 'mobx-persist'
import { IPost } from '@stores/posts'

export default class Notifications extends BaseStore {
    // the time last checked
    // @persist
    @observable lastCheckedNotifications = 0
    @observable cursorId = 0

    // all the notifications
    @observable notifications = observable.map<string, IPost>()

    private readonly authStore: IStores['newAuthStore']  = getNewAuthStore()

    constructor() {
        super()

        reaction(
            () => this.authStore.hasAccount,
            (hasAccount) => {
                if (hasAccount) {
                    this.fetchNotifications()
                }
            }, {
                fireImmediately: true,
            }
        )
    }

    @computed get hasMoreThanQueriedNotifications() {
        return this.cursorId !== 0
    }

    @task
    @action.bound
    async fetchNotifications() {
        try {
            const { payload, cursorId } = await discussions.getPostsForNotifications(
                this.authStore.activePublicKey,
                this.lastCheckedNotifications
            )

            payload.forEach(notification => {
                this.notifications.set(notification.uuid, notification as any)
            })
            
            this.lastCheckedNotifications = Date.now()
            this.cursorId = cursorId
        } catch (error) {
            throw error
        }
    }
}

export const getNotificationsStore = getOrCreateStore('notificationsStore', Notifications)
