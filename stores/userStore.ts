import { persist } from 'mobx-persist'
import { observable } from 'mobx'
import { hydrate, RootStore } from '@stores/index'
import axios from 'axios'
import _ from 'lodash'
import { setCookie, parseCookies } from 'nookies'
import { discussions, nsdb, Post } from '@novuspherejs'
import moment from 'moment'
import mapSeries from 'async/mapSeries'
import each from 'async/each'
import thread from '@novuspherejs/discussions/thread'
import { encodeId, getThreadTitle } from '@utils'

export type BlockedContentSetting = 'hidden' | 'collapsed'

export class UserStore {
    @persist('map') following = observable.map<string, string>()
    @persist('map') watching = observable.map<string, [number, number]>() // [currentCount, prevCount]
    @persist('map') blockedUsers = observable.map<string, string>() // [pubKey, displayName]
    @persist('map') blockedPosts = observable.map<string, string>() // [asPathURL, yyyydd]
    @persist('map') delegated = observable.map<string, string>() // [name:pubKey:tagName, tagName]
    @persist('map') pinnedPosts = observable.map<string, string>() // [asPathURL, tagName]

    blockedByDelegation = observable.map<string, string>() // either blockedUsers or blockedPosts

    @observable notificationCount = 0
    @observable lastCheckedNotifications = 0
    @observable notifications: Post[] = []

    @persist
    @observable
    blockedContentSetting: BlockedContentSetting = 'collapsed'

    @persist
    @observable
    unsignedPostsIsSpam = true

    @observable private uiStore: RootStore['uiStore']
    @observable private tagStore: RootStore['tagStore']

    constructor(rootStore: RootStore) {
        this.uiStore = rootStore.uiStore
        this.tagStore = rootStore.tagStore
    }

    hydrate(initialState: any = {}) {
        if (initialState.pinnedPosts) {
            this.pinnedPosts = observable.map<string, string>(initialState.pinnedPosts)
        }

        if (initialState.unsignedPostsIsSpam) {
            this.unsignedPostsIsSpam = initialState.unsignedPostsIsSpam
        }
    }

    setBlockedContent = (type: BlockedContentSetting) => {
        this.blockedContentSetting = type
        this.syncDataFromLocalToServer()
    }

    toggleUnsignedPostsIsSpam = () => {
        this.unsignedPostsIsSpam = !this.unsignedPostsIsSpam
        this.syncDataFromLocalToServer()
    }

    private async setAndUpdateDelegatedPosts(
        mergedName: string,
        tagName: string,
        suppressAlert = false
    ) {
        if (!suppressAlert) {
            if (!tagName || tagName === '') {
                this.uiStore.showMessage(
                    'An empty tag string is not valid. Set this user as a global mod by setting the tag to be "all".',
                    'error'
                )
                return
            }
        }

        this.delegated.set(mergedName, tagName)

        if (!suppressAlert) {
            this.uiStore.showMessage('Added user as a moderator', 'success')
        }

        try {
            return await this.updateFromActiveDelegatedMembers()
        } catch (error) {
            return error
        }
    }

    /**
     * Input: USERNAME:KEY:TAG
     * Output: [tag]
     * @param username
     * @param pub
     */
    activeModerationForCurrentUser = (username, pub) => {
        const vals = [...this.delegated.keys()]
        return vals
            .filter(val => val.indexOf(`${username}:${pub}`) !== -1)
            .map(val => val.split(':')[2])
    }

    async setPinnedPosts(posts: any[], delegated = false) {
        let obj = {}

        _.forEach(posts, (urls, name: string) => {
            _.forEach(urls, url => {
                Object.assign(obj, {
                    [url]: name,
                })
            })
        })

        Object.assign(obj, this.pinnedPosts.toJSON())

        const b64 = Buffer.from(JSON.stringify(obj)).toString('base64')

        if (delegated) {
            setCookie(null, 'pinnedByDelegation', b64, { path: '/' })
        } else {
            setCookie(null, 'pinnedPosts', b64, { path: '/' })
        }

        this.syncDataFromLocalToServer()
    }

    async updateFromActiveDelegatedMembers() {
        try {
            return await Promise.all(
                [...this.delegated.keys()].map(async delegatedMember => {
                    const [, key] = delegatedMember.split(':')
                    const { data } = await axios.get(
                        `https://atmosdb.novusphere.io/discussions/moderation/${key}`
                    )

                    if (data.hasOwnProperty('moderation')) {
                        const blockedPosts = data['moderation']['blockedPosts']
                        const pinnedPosts = data['moderation']['pinnedPosts']
                        const blockedPostsKeys = Object.keys(blockedPosts)

                        if (pinnedPosts) {
                            this.setPinnedPosts(pinnedPosts, true)
                        }

                        if (blockedPostsKeys.length) {
                            blockedPostsKeys.forEach(datestamp => {
                                const blockedPostForDateStamp: string[] = blockedPosts[datestamp]
                                if (blockedPostForDateStamp.length) {
                                    blockedPostForDateStamp.forEach(blockedPost => {
                                        if (this.blockedByDelegation)
                                            this.blockedByDelegation.set(blockedPost, datestamp)
                                    })
                                }
                            })
                        }
                    }
                })
            )
        } catch (error) {
            throw error
        }
    }

    setModerationFromDropdown = async (username, key, tags: string[]) => {
        // use tags are source of truth for self-delegated
        const current = this.activeModerationForCurrentUser(username, key)
        const usernameWithKey = `${username}:${key}`

        if (tags.length > current.length) {
            // adding
            tags.map(tag => {
                this.delegated.set(`${usernameWithKey}:${tag}`, tag)
            })
        } else if (tags.length < current.length) {
            // remove diff
            const diff = _.difference(current, tags)
            diff.map(tag => {
                this.delegated.delete(`${usernameWithKey}:${tag}`)
            })
        }

        this.uiStore.showMessage('Moderation list updated', 'success')
        this.syncDataFromLocalToServer()
    }

    async setModerationMemberByTag(
        accountNameWithPubKey: string,
        tagName = '',
        suppressAlert = false,
        override = false
    ) {
        const mergedName = `${accountNameWithPubKey}:${tagName}`

        try {
            if (override) {
                return await this.setAndUpdateDelegatedPosts(mergedName, tagName, suppressAlert)
            }

            if (this.delegated.has(mergedName)) {
                if (this.delegated.get(mergedName) === tagName) {
                    this.delegated.delete(mergedName)

                    if (!suppressAlert) {
                        this.uiStore.showMessage('Removed user as a moderator', 'success')
                    }
                } else {
                    await this.setAndUpdateDelegatedPosts(mergedName, tagName, suppressAlert)
                }
            } else {
                await this.setAndUpdateDelegatedPosts(mergedName, tagName, suppressAlert)
            }
        } catch (error) {
            return error
        }

        this.syncDataFromLocalToServer()
    }

    toggleUserFollowing = (user: string, pub: string) => {
        if (this.following.has(pub)) {
            this.following.delete(pub)
            this.uiStore.showMessage('This user has been unfollowed!', 'success')
        } else {
            this.following.set(pub, user)
            this.uiStore.showMessage('You are now following this user!', 'success')
        }

        this.syncDataFromLocalToServer()
    }

    /**
     * @param {string} asPathURL - i.e. /tag/test/1hx6xdq9iwehn/testt
     */
    toggleBlockPost = (asPathURL: string) => {
        if (this.blockedPosts.has(asPathURL)) {
            this.blockedPosts.delete(asPathURL)
            this.uiStore.showMessage('This post has been unmarked as spam!', 'success')
        } else {
            const dateStamp = `${moment(Date.now()).format('YYYYMM')}`
            this.blockedPosts.set(asPathURL, dateStamp)
            this.uiStore.showMessage('This post has been marked as spam!', 'success')
        }

        this.syncDataFromLocalToServer()
    }

    toggleBlockUser = (displayName: string, pubKey: string) => {
        if (this.blockedUsers.has(pubKey)) {
            this.blockedUsers.delete(pubKey)
        } else {
            this.blockedUsers.set(pubKey, displayName)
        }

        this.syncDataFromLocalToServer()
    }

    toggleThreadWatch = (id: string, count: number, suppressToast = false) => {
        if (this.watching.has(id)) {
            this.watching.delete(id)
            this.syncDataFromLocalToServer()
            if (!suppressToast)
                this.uiStore.showMessage('You are no longer watching this thread', 'info')
            return
        }

        if (this.watching.size <= 4) {
            this.watching.set(id, [count, count])
            if (!suppressToast)
                this.uiStore.showMessage('Success! You are watching this thread', 'success')
        } else {
            if (!suppressToast)
                this.uiStore.showMessage('You can only watch a maximum of 5 threads', 'info')
        }

        this.syncDataFromLocalToServer()
    }

    togglePinPost = (tagName: string, asPathURL: string) => {
        const pinnedPostsBuffer = parseCookies(window)
        let pinnedPostsAsObj = {}

        if (pinnedPostsBuffer.pinnedByDelegation) {
            pinnedPostsAsObj = JSON.parse(
                Buffer.from(pinnedPostsBuffer.pinnedByDelegation, 'base64').toString('ascii')
            )
        }

        if (this.pinnedPosts.has(asPathURL)) {
            this.uiStore.showMessage('This post has been unpinned!', 'success')
            this.pinnedPosts.delete(asPathURL)

            if (pinnedPostsAsObj[asPathURL]) {
                delete pinnedPostsAsObj[asPathURL]
            }
        } else {
            this.pinnedPosts.set(asPathURL, tagName)
            this.uiStore.showMessage('This post has been pinned!', 'success')

            pinnedPostsAsObj = {
                ...pinnedPostsAsObj,
                [asPathURL]: tagName,
            }
        }

        this.syncDataFromLocalToServer()
        const b64 = Buffer.from(JSON.stringify(pinnedPostsAsObj)).toString('base64')
        setCookie(window, 'pinnedByDelegation', b64, { path: '/' })
    }

    /**
     * Syncing user data with the server
     */
    syncDataFromServerToLocal = async (privateKey: string) => {
        try {
            const { data } = await nsdb.getAccount(privateKey)
            console.log(data)
            if (data) {
                this.lastCheckedNotifications = data['lastCheckedNotifications']
                this.watching.replace(data['watching'])
                this.tagStore.subscribed.replace(data['tags'])
                this.following.replace(data['following'].map(obj => [obj.pub, obj.name]))
                this.blockedPosts.replace(data['moderation']['blockedPosts'])
                this.delegated.replace(data['moderation']['delegated'])
                this.blockedUsers.replace(data['moderation']['blockedUsers'])
                this.pinnedPosts.replace(data['moderation']['pinnedPosts'])
                this.unsignedPostsIsSpam = data['moderation']['unsignedPostsIsSpam']
                this.blockedContentSetting = data['moderation']['blockedContentSetting']

                hydrate(localStorage)('userStore', this).rehydrate()
                hydrate(localStorage)('tagStore', this.tagStore).rehydrate()
            }
        } catch (error) {
            console.log(error)
            this.uiStore.showToast(
                'Unable to sync',
                'We were unable to sync your account data to your current browser',
                'info'
            )
            return error
        }
    }

    /**
     * Sync the current data in LS to the server
     */
    syncDataFromLocalToServer = async () => {
        try {
            const following = [...this.following.toJS()].map(([pub, name]) => ({
                pub,
                name,
            }))

            // we have to send the entire payload, not just the diff
            const dataToSync = {
                lastCheckedNotifications: this.lastCheckedNotifications,
                watching: [...this.watching.toJS()],
                following: following,
                tags: [...this.tagStore.subscribed.toJS()],
                moderation: {
                    blockedPosts: [...this.blockedPosts.toJS()],
                    blockedUsers: [...this.blockedUsers.toJS()],
                    pinnedPosts: [...this.pinnedPosts.toJS()],
                    delegated: [...this.delegated.toJS()],
                    blockedContentSetting: this.blockedContentSetting,
                    unsignedPostsIsSpam: this.unsignedPostsIsSpam,
                },
            }

            const { postPriv } = parseCookies(window)
            if (!postPriv) return

            await nsdb.saveAccount(postPriv, dataToSync)
        } catch (error) {
            this.uiStore.showToast(
                'Unable to sync',
                'We were unable to sync your data to our servers.',
                'info'
            )
            return error
        }
    }

    /**
     * Update thread watch count by calling this method
     * in an interval. Compare the threadReplyCounts [currentCount, previousCount]
     */
    watchAndUpdateWatchedPostsCount = async () => {
        try {
            if (!this.watching.size) return

            const threads = [...this.watching.keys()]

            mapSeries(
                threads,
                (encodedThreadId, cb) => {
                    discussions
                        .getThreadReplyCount(encodedThreadId)
                        .then(threadReplyCount => {
                            const [, diff] = this.watching.get(encodedThreadId)
                            if (threadReplyCount - diff > 0) {
                                return cb(null, [encodedThreadId, threadReplyCount - diff, threadReplyCount])
                            }
                            return cb()
                        })
                        .catch(error => {
                            return cb(null, error.message)
                        })
                },
                async (error, result) => {
                    // results is an array of objects [encodedId, diff]
                    if (result[0] !== undefined && result.length > 0) {
                        each(result, async (item, cb) => {
                            const [threadId, diff, currentCount] = item
                            const thread = await discussions.getThread(threadId)
                            const id = encodeId(thread.openingPost)
                            const tag: any = this.tagStore.tagModelFromObservables(
                                thread.openingPost.sub
                            )

                            this.notifications.push({
                                ...thread.openingPost,
                                url: `/tag/${thread.openingPost.sub}/${id}/${getThreadTitle(
                                    thread.openingPost
                                )}`,
                                displayName: `#${thread.openingPost.sub}`,
                                content: `There are ${diff} new unread posts`,
                                tag,
                                createdAt: Date.now(),
                            } as any)

                            this.notificationCount += 1
                            this.watching.set(threadId, [currentCount, currentCount])

                            return cb()
                        })
                    }
                }
            )
        } catch (error) {
            return error
        }
    }

    /**
     * Delete a notification by index
     *
     * We don't have to clear the badge count because when the user opens the tray
     * it will auto clear.
     * @param {number} index
     */
    deleteNotification = index => {
        this.notifications.splice(index, 1)
    }

    fetchNotifications = async (publicKey: string): Promise<void> => {
        try {
            let { payload } = await discussions.getPostsForNotifications(
                publicKey,
                this.lastCheckedNotifications,
                undefined,
                0
            )

            this.notificationCount = payload.length
            this.notifications = [...this.notifications, ...payload]

            this.watchAndUpdateWatchedPostsCount()
        } catch (error) {
            this.notifications = []
            return error
        }
    }

    clearNotifications = () => {
        this.notifications = []
        this.notificationCount = 0
        this.uiStore.showMessage('Notifications cleared', 'success')
    }

    /**
     * We need to reset the thread watch counter when the user clicks the notification tray
     * so the next time we fetch notifications we aren't showing them a new post.
     * [encodedId]: [currentCount, previousCount]
     *
     */
    resetThreadWatchCounts = () => {
        // this.watching.forEach(([curr, diff], encodedThread) => {
        //     this.watching.set(encodedThread, [curr, curr])
        // })
    }
}
