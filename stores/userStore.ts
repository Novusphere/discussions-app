import { persist } from 'mobx-persist'
import { observable } from 'mobx'
import { RootStore } from '@stores/index'
import axios from 'axios'
import _ from 'lodash'
import { setCookie, parseCookies } from 'nookies'
import { discussions, Post } from '@novuspherejs'

export class UserStore {
    @persist('map') following = observable.map<string, string>()
    @persist('map') watching = observable.map<string, [number, number]>() // [currentCount, prevCount]
    @persist('map') blockedUsers = observable.map<string, string>() // [pubKey, displayName]
    @persist('map') blockedPosts = observable.map<string, string>() // [asPathURL, yyyydd]
    @persist('map') delegated = observable.map<string, string>() // [name:pubKey:tagName, tagName]
    @persist('map') pinnedPosts = observable.map<string, string>() // [asPathURL, tagName]

    blockedByDelegation = observable.map<string, string>() // either blockedUsers or blockedPosts

    @observable notificationsPosition = {
        cursorId: undefined,
        count: 0,
    }
    @observable lastCheckedNotifications = 0
    @observable notifications: Post[] = []

    @observable private uiStore: RootStore['uiStore']


    constructor(rootStore: RootStore) {
        this.uiStore = rootStore.uiStore
    }

    hydrate(initialState: any = {}) {
         if (initialState.pinnedPosts) {
            this.pinnedPosts = observable.map<string, string>(initialState.pinnedPosts)
        }
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
        return vals.filter(val => val.indexOf(`${username}:${pub}`) !== -1).map(val => val.split(':')[2])
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
    }

    toggleUserFollowing = (user: string, pub: string) => {
        if (this.following.has(pub)) {
            this.following.delete(pub)
            this.uiStore.showMessage('This user has been unfollowed!', 'success')
        } else {
            this.following.set(pub, user)
            this.uiStore.showMessage('You are now following this user!', 'success')
        }
    }

    /**
     * @param {string} asPathURL - i.e. /tag/test/1hx6xdq9iwehn/testt
     */
    toggleBlockPost = (asPathURL: string) => {
        if (this.blockedPosts.has(asPathURL)) {
            this.blockedPosts.delete(asPathURL)
            this.uiStore.showMessage('This post has been unmarked as spam!', 'success')
        } else {
            const date = new Date(Date.now())
            const dateStamp = `${date.getFullYear()}${date.getMonth()}`
            this.blockedPosts.set(asPathURL, dateStamp)
            this.uiStore.showMessage('This post has been marked as spam!', 'success')
        }
    }

    toggleBlockUser = (displayName: string, pubKey: string) => {
        if (this.blockedUsers.has(pubKey)) {
            this.blockedUsers.delete(pubKey)
        } else {
            this.blockedUsers.set(pubKey, displayName)
        }
    }

    toggleThreadWatch = (id: string, count: number, suppressToast = false) => {
        if (this.watching.has(id)) {
            this.watching.delete(id)
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

        const b64 = Buffer.from(JSON.stringify(pinnedPostsAsObj)).toString('base64')
        setCookie(window, 'pinnedByDelegation', b64, { path: '/' })
    }

    fetchNotifications = async (publicKey: string): Promise<void> => {
        try {
            let { payload, cursorId } = await discussions.getPostsForNotifications(
                publicKey,
                this.lastCheckedNotifications,
                this.notificationsPosition.cursorId,
                5,
            )

            this.notificationsPosition = {
                cursorId: cursorId,
                count: payload.length,
            }

            this.notifications = payload
        } catch (error) {
            this.notifications = []
            return error
        }
    }
}
