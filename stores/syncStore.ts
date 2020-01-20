import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { task } from 'mobx-task'
import { action, autorun, observable, observe, reaction, when } from 'mobx'
import { nsdb } from '@novuspherejs'
import {
    getAuthStore,
    getNotificationsStore,
    getSettingsStore,
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
    private readonly settingsStore: IStores['settingsStore'] = getSettingsStore()

    @observable syncedData: any = null

    constructor() {
        super()

        reaction(
            () => this.authStore.hasAccount,
            async () => {
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

                    if (!_.isUndefined(data.uidw)) {
                        this.syncUIDWWithDB(data.uidw)
                    }
                }

                this.userStore.updateFromActiveDelegatedMembers()
            }
        )

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

        when(
            () => this.authStore.uidWalletPubKey.length > 0,
            () => {
                this.saveDataWithSyncedData({
                    uidw: this.authStore.activeUidWalletKey,
                })
            }
        )

        autorun(() => {
            const { blockedContentSetting, unsignedPostsIsSpam } = this.settingsStore
            const { blockedUsers, blockedPosts } = this.userStore

            if (blockedUsers || blockedPosts || blockedContentSetting) {
                const moderation = {
                    blockedUsers: null,
                    blockedPosts: null,
                    blockedContentSetting: '',
                }

                const blockedUsersToSync = []

                blockedUsers.forEach((name, pub) => {
                    blockedUsersToSync.push(`${name}:${pub}`)
                })

                const blockedPostsToSync = {}

                blockedPosts.forEach((timestamp, uuid) => {
                    const prev = blockedPostsToSync[timestamp] || []
                    Object.assign(blockedPostsToSync, {
                        [timestamp]: [...prev, uuid],
                    })
                })

                Object.assign(moderation, {
                    blockedUsers: {
                        ...moderation.blockedUsers,
                        ...blockedUsersToSync,
                    },
                    blockedPosts: {
                        ...moderation.blockedPosts,
                        ...blockedPostsToSync,
                    },
                    blockedContentSetting: blockedContentSetting,
                    unsignedPostsIsSpam: unsignedPostsIsSpam,
                })

                this.saveDataWithSyncedData({
                    moderation: moderation,
                })
            }
        })
    }

    @action.bound
    syncUIDWWithDB(uidw: string) {
        this.authStore.uidWalletPubKey = uidw
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
        if (moderation.hasOwnProperty('blockedContentSetting')) {
            this.settingsStore.setBlockedContentSetting(moderation.blockedContentSetting)
        }

        if (moderation.hasOwnProperty('unsignedPostsIsSpam')) {
            this.settingsStore.setUnsignedPostsAsSpamSetting(moderation.unsignedPostsIsSpam)
        }

        if (moderation.hasOwnProperty('blockedUsers')) {
            this.userStore.blockedUsers.clear()
            _.forEach(moderation.blockedUsers, user => {
                const [name, pub] = user.split(':')
                if (!this.userStore.blockedUsers.has(pub)) {
                    this.userStore.blockedUsers.set(pub, name)
                }
            })
        }

        if (moderation.hasOwnProperty('blockedPosts')) {
            this.userStore.blockedPosts.clear()
            _.forEach(moderation.blockedPosts, (posts, date) => {
                _.forEach(posts, post => {
                    if (!this.userStore.blockedPosts.has(post)) {
                        this.userStore.blockedPosts.set(post, date)
                    }
                })
            })
        }
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
