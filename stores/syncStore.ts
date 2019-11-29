import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { task } from 'mobx-task'
import { action, autorun, observable, observe, reaction } from 'mobx'
import { nsdb } from '@novuspherejs'
import { getAuthStore, getTagStore, getUserStore, IStores } from '@stores/index'
import { IAccountSync } from '@d.ts/account-sync'

export default class SyncStore extends BaseStore {
    private readonly authStore: IStores['authStore'] = getAuthStore()
    private readonly tagStore: IStores['tagStore'] = getTagStore()
    private readonly userStore: IStores['userStore'] = getUserStore()

    @observable syncedData: any = null

    constructor() {
        super()

        const disposeSync = autorun(async () => {
            if (this.authStore.hasAccount && this.authStore.activePrivateKey) {
                const { data } = await this.getAccountWithPrivateKey(
                    this.authStore.activePrivateKey
                )

                this.syncedData = data

                if (data.tags) {
                    this.syncSubscribedTagsWithDB(data.tags)
                }

                if (data.following) {
                    this.syncFollowerListWitHDB(data.following)
                }

                if (data.watching) {
                    this.syncWatchingListWithDB(data.watching)
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
    private async saveDataWithSyncedData(data: any) {
        if (this.authStore.activePrivateKey) {
            this.saveAccountDataWithPrivateKey(this.authStore.activePrivateKey, {
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
