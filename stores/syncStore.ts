import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { task } from 'mobx-task'
import { action, autorun, observable, observe, reaction } from 'mobx'
import { nsdb } from '@novuspherejs'
import {
    getAuthStore,
    getNotificationsStore,
    getTagStore,
    getUserStore,
    IStores,
} from '@stores/index'
import { IAccountSync } from '@d.ts/account-sync'
import _ from 'lodash'

export default class SyncStore extends BaseStore {
    private readonly authStore: IStores['authStore'] = getAuthStore()
    private readonly tagStore: IStores['tagStore'] = getTagStore()
    private readonly userStore: IStores['userStore'] = getUserStore()
    private readonly notificationsStore: IStores['notificationsStore'] = getNotificationsStore()

    @observable syncedData: any = null

    constructor() {
        super()

        const disposeSync = autorun(async () => {
            if (this.authStore.hasAccount && this.authStore.activePrivateKey) {
                const accountData = await this.getAccountWithPrivateKey(
                    this.authStore.activePrivateKey
                )

                if (accountData) {
                    const data = accountData['data']

                    this.syncedData = data

                    if (!_.isUndefined(data.tags)) {
                        this.syncSubscribedTagsWithDB(data.tags)
                    }

                    if (!_.isUndefined(data.following)) {
                        this.syncFollowerListWitHDB(data.following)
                    }

                    if (!_.isUndefined(data.watching)) {
                        this.syncWatchingListWithDB(data.watching)
                    }

                    if (!_.isUndefined(data.lastCheckedNotifications)) {
                        this.syncNotificationTimeWithDB(data.lastCheckedNotifications)
                    }

                    if (!_.isUndefined(data.moderation)) {
                        this.syncModerationListWithDB(data.moderation)
                    }
                }

                disposeSync()
            }
        })

        // sync tag subs
        reaction(
            () => this.tagStore.subSubscriptionStatus.length,
            () => {
                this.saveDataWithSyncedData({
                    tags: this.tagStore.subSubscriptionStatus,
                })
            }
        )

        reaction(
            () => this.notificationsStore.lastCheckedNotifications,
            lastCheckedNotifications => {
                this.saveDataWithSyncedData({
                    lastCheckedNotifications,
                })
            }
        )

        observe(this.userStore.following, change => {
            this.saveDataWithSyncedData({
                following: change.object.toJSON(),
            })
        })

        observe(this.userStore.watching, change => {
            this.saveDataWithSyncedData({
                watching: change.object.toJSON(),
            })
        })

        observe(this.userStore.blocked, change => {
            const moderationListToSync = []

            change.object.forEach((name, pub) => {
                moderationListToSync.push(`${name}:${pub}`)
            })

            this.saveDataWithSyncedData({
                moderation: {
                    blockedUsers: moderationListToSync,
                },
            })
        })
    }

    @action.bound
    syncNotificationTimeWithDB(time: number) {
        this.notificationsStore.lastCheckedNotifications = time
    }

    @action.bound
    syncSubscribedTagsWithDB(tags: string[]) {
        this.tagStore.subSubscriptionStatus = tags
    }

    @action.bound
    syncFollowerListWitHDB(following: any) {
        this.userStore.following.replace(following)
    }

    @action.bound
    syncWatchingListWithDB(watching: any) {
        this.userStore.watching.replace(watching)
    }

    @action.bound
    syncModerationListWithDB(moderation) {
        if (moderation.blockedUsers) {
            this.userStore.blocked.clear()

            moderation.blockedUsers.forEach(user => {
                const [name, pub] = user.split(':')
                this.userStore.blocked.set(pub, name)
            })
        }

        // do blockedPosts
    }

    @action.bound
    private async saveDataWithSyncedData(data: any) {
        const { activePrivateKey } = this.authStore

        if (activePrivateKey) {
            this.saveAccountDataWithPrivateKey(activePrivateKey, {
                ...this.syncedData,
                ...data,
            })
        }
    }

    @task
    @action.bound
    private async getAccountWithPrivateKey(pk: string): Promise<IAccountSync> {
        try {
            return await nsdb.getAccount(pk)
        } catch (error) {
            throw error
        }
    }

    @task
    @action.bound
    private async saveAccountDataWithPrivateKey(pk: string, data: any) {
        try {
            return await nsdb.saveAccount(pk, data)
        } catch (error) {
            throw error
        }
    }
}

export const getSyncStore = getOrCreateStore('syncStore', SyncStore)
