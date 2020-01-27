import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { task } from 'mobx-task'
import { action, autorun, observable, observe, reaction, when } from 'mobx'
import { nsdb } from '@novuspherejs'
import {
    getAuthStore,
    getNotificationsStore,
    getSettingsStore,
    getTagStore,
    getUiStore,
    getUserStore,
    IStores,
} from '@stores/index'
import { IAccountSync } from '@d.ts/account-sync'
import _ from 'lodash'

export default class SyncStore extends BaseStore {
    private readonly authStore: IStores['authStore'] = getAuthStore()
    private readonly tagStore: IStores['tagStore'] = getTagStore()
    private readonly userStore: IStores['userStore'] = getUserStore()
    private readonly uiStore: IStores['uiStore'] = getUiStore()
    private readonly notificationsStore: IStores['notificationsStore'] = getNotificationsStore()
    private readonly settingsStore: IStores['settingsStore'] = getSettingsStore()

    @observable syncedData: any = null

    constructor() {
        super()

        setInterval(() => {
            this.userStore.updateFromActiveDelegatedMembers()
        }, 30000)

        autorun(async () => {
            if (!this.uiStore.isServer) {
                if (this.authStore.hasAccount) {
                    const accountData = await this.getAccountWithPrivateKey(
                        this.authStore.activePrivateKey
                    )

                    if (accountData) {
                        const data = accountData['data']

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

                        this.syncedData = data
                    }
                }
            }
        })

        autorun(() => {
            const { blockedContentSetting, unsignedPostsIsSpam } = this.settingsStore
            const { activeUidWalletKey } = this.authStore
            const { blockedUsers, blockedPosts, pinnedPosts, following, watching } = this.userStore
            const { subSubscriptionStatus, requiresSync } = this.tagStore
            const { lastCheckedNotifications } = this.notificationsStore

            if (
                this.syncedData &&
                (blockedUsers ||
                    blockedPosts ||
                    blockedContentSetting ||
                    pinnedPosts ||
                    subSubscriptionStatus ||
                    activeUidWalletKey ||
                    requiresSync === true)
            ) {
                const moderation = {
                    blockedUsers: null,
                    blockedPosts: null,
                    blockedContentSetting: '',
                    pinnedPosts: null,
                }

                // deal with blocked users
                const blockedUsersToSync = []

                blockedUsers.forEach((name, pub) => {
                    blockedUsersToSync.push(`${name}:${pub}`)
                })

                // deal with blocked posts
                const blockedPostsToSync = {}

                blockedPosts.forEach((timestamp, uuid) => {
                    const prev = blockedPostsToSync[timestamp] || []
                    Object.assign(blockedPostsToSync, {
                        [timestamp]: [...prev, uuid],
                    })
                })

                // deal with pinned posts
                const pinnedPostsToSync = {}

                _.forEach([...pinnedPosts.entries()], ([asPathURL, name]) => {
                    if (pinnedPostsToSync[name]) {
                        const posts = pinnedPostsToSync[name]
                        pinnedPostsToSync[name] = [...posts, asPathURL]
                    } else {
                        Object.assign(pinnedPostsToSync, {
                            [name]: [asPathURL],
                        })
                    }
                })

                // deal with following
                const followingUsersToSync = _.map(following.toJSON(), (name, pub) => {
                    return {
                        pub,
                        name,
                    }
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
                    pinnedPosts: pinnedPostsToSync,
                })

                this.saveDataWithSyncedData({
                    lastCheckedNotifications,
                    uidw: activeUidWalletKey,
                    watching: watching.toJSON(),
                    tags: subSubscriptionStatus,
                    following: followingUsersToSync,
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
        const obj = {}

        _.forEach(following, user => {
            Object.assign(obj, {
                [user.pub]: user.name,
            })
        })

        this.userStore.following.replace(obj)
    }

    @action.bound
    syncWatchingListWithDB(watching: any) {
        this.userStore.watching.replace(watching)
    }

    @action.bound
    syncPinnedPostsWithDB(posts: any) {
        return this.userStore.setPinnedPosts(posts)
    }

    @action.bound
    syncModerationListWithDB(moderation) {
        if (moderation.hasOwnProperty('blockedContentSetting')) {
            this.settingsStore.setBlockedContentSetting(moderation.blockedContentSetting)
        }

        if (moderation.hasOwnProperty('unsignedPostsIsSpam')) {
            this.settingsStore.setUnsignedPostsAsSpamSetting(moderation.unsignedPostsIsSpam)
        }

        if (moderation.hasOwnProperty('pinnedPosts')) {
            this.syncPinnedPostsWithDB(moderation.pinnedPosts)
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
