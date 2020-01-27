import { action, computed, observable } from 'mobx'
import { discussions, Post, Thread } from '@novuspherejs'
import { task } from 'mobx-task'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { CreateForm } from '@components'
import { getTagStore } from '@stores/tagStore'
import { getAuthStore, getUiStore, getUserStore, IStores } from '@stores'
import {
    encodeId,
    generateUuid,
    generateVoteObject,
    getAttachmentValue,
    isServer,
    pushToThread,
} from '@utils'
import { ThreadModel } from '@models/threadModel'
import FeedModel from '@models/feedModel'
import _ from 'lodash'
import PostModel from '@models/postModel'

export interface IAttachment {
    value: string
    type: string
    display: string
}

export interface IPost {
    id: number
    transaction: string
    blockApprox: number
    chain: string
    parentUuid: string
    threadUuid: string
    uuid: string
    title: string
    poster: string
    displayName: string
    pub: string
    content: string
    createdAt: Date
    sub: string
    tags: string[]
    mentions: string[]
    edit: boolean
    anonymousId: string
    anonymousSignature: string
    verifyAnonymousSignature: string
    attachment: IAttachment
    replies: any[]
    totalReplies: number
    score: number
    upvotes: number
    downvotes: number
    alreadyVoted: boolean
}

export interface IPreviewPost {
    title: string
    sub: { value: string; label: string }
    content: string
}

export default class PostsStore extends BaseStore {
    // all posts by filter
    @observable posts: Post[] = []

    @observable postsPosition = {
        items: 0,
        cursorId: undefined,
    }

    @observable preview: IPreviewPost | null = null

    @observable activeThreadId = ''

    // when creating a new post
    @observable newPostTag = { value: '', label: '' }

    @observable posting = false // for spinner

    /**
     * Manage getRepliesFromMap within a post (not opening post)
     */
    @observable replyingPostUUID = '' // which post the user is currently replying to
    @observable replyingPostContent = '' // which post the user is currently replying to

    /**
     * Manage getRepliesFromMap of the opening post
     */
    @observable openingPostReplyContent = ''

    @observable activeThreadSerialized: Thread
    @observable activeThread: ThreadModel

    @observable currentHighlightedPostUuid = ''

    @observable firstSplash = true

    private readonly tagsStore: IStores['tagStore'] = getTagStore()
    private readonly uiStore: IStores['uiStore'] = getUiStore()
    private readonly authStore: IStores['authStore'] = getAuthStore()
    private readonly userStore: IStores['userStore'] = getUserStore()

    constructor() {
        super()
    }

    @action.bound
    highlightPostUuid(uuid: string) {
        this.currentHighlightedPostUuid = uuid
    }

    public resetPositionAndPosts = () => {
        this.posts = []
        this.postsPosition = {
            items: 0,
            cursorId: undefined,
        }
    }

    @task
    @action.bound
    async getPostsForSubs(subs = this.tagsStore.subSubscriptionStatus) {
        try {
            if (!subs.length) subs = ['all']

            const { posts, cursorId } = await discussions.getPostsForSubs(
                subs,
                this.postsPosition.cursorId,
                this.postsPosition.items,
                20,
                this.getKeyForAPICall
            )

            this.posts = [...this.posts, ...posts]

            this.postsPosition = {
                items: this.posts.length,
                cursorId,
            }

            return this.posts
        } catch (error) {
            return error
        }
    }

    @task
    @action.bound
    async getPostsForKeys(keys) {
        try {
            const { posts, cursorId } = await discussions.getPostsForKeys(
                keys,
                this.postsPosition.cursorId,
                this.postsPosition.items,
                20,
                this.getKeyForAPICall
            )

            this.posts = [...this.posts, ...posts]

            this.postsPosition = {
                items: this.posts.length,
                cursorId,
            }

            return posts
        } catch (error) {
            console.log(error)
            return error
        }
    }

    get getKeyForAPICall() {
        let key = this.authStore.activePublicKey

        if (!key && !isServer) {
            const auth = JSON.parse(window.localStorage.getItem('auth'))
            if (auth) {
                key = auth.statusJson.bk.post
            } else {
                key = ''
            }
        }

        return key
    }

    @computed get pinnedPosts() {
        let posts = {}

        const user = JSON.parse(window.localStorage.getItem('user'))

        if (user) {
            if (user.hasOwnProperty('pinnedPosts')) {
                _.merge(posts, user['pinnedPosts'])
            }

            if (user.hasOwnProperty('pinnedByDelegation')) {
                _.merge(posts, user['pinnedByDelegation'])
            }

        }

        return posts
    }

    @task
    getPostsByTag = async (tags: string[], fresh = false) => {
        try {
            const { posts, cursorId } = await discussions.getPostsForTags(
                tags,
                this.postsPosition.cursorId,
                this.postsPosition.items,
                20,
                this.getKeyForAPICall
            )

            let pinnedPosts = []

            // get pinned posts to put at the front
            if (this.pinnedPosts && Object.keys(this.pinnedPosts).length > 0) {
                await Promise.all(
                    _.map(this.pinnedPosts, async (name, url) => {
                        if (tags[0] === name) {
                            const post = await discussions.getPostsByAsPathURL(
                                url,
                                this.getKeyForAPICall
                            )
                            post.pinned = true
                            pinnedPosts.push(post)
                        }
                    })
                )
            }

            if (fresh) {
                this.posts = [...pinnedPosts, ...posts]
            } else {
                this.posts = [...pinnedPosts, ...this.posts, ...posts]
            }

            this.postsPosition = {
                items: this.posts.length,
                cursorId: cursorId,
            }

            return this.posts
        } catch (error) {
            return error
        }
    }

    /**
     * Threads shown in the feed for an active tag/sub
     */
    @computed get feedThreads(): FeedModel[] | null {
        if (!this.posts || !this.posts.length) {
            return null
        }

        return this.posts
            .filter(post => post.parentUuid === '')
            .map(post => new FeedModel(post as any))
    }

    @task
    @action.bound
    public async getAndSetThread(id: string): Promise<null | Thread> {
        try {
            const thread = await discussions.getThread(id, this.getKeyForAPICall)
            if (!thread) return null
            this.activeThreadSerialized = thread
            this.activeThreadId = id
            this.activeThread = new ThreadModel(thread)
            return thread
        } catch (error) {
            throw error
        }
    }

    /**
     * Get the list of users in the current thread for tagging.
     * TODO: Add users the current active user follows as well
     * @returns {id: string, value: string}[]
     */
    @computed get getPossibleUsersToTag() {
        if (!this.activeThread) return []

        return _.uniqBy(
            _.map(_.filter(this.activeThread.map, posts => posts.pub.length), posts => {
                let poster = posts.poster

                if (poster === 'eosforumanon') {
                    poster = posts.displayName
                }

                return {
                    id: `${posts.pub}-${posts.uidw}`,
                    value: poster,
                    icon: posts.imageData,
                }
            }),
            option => option.id
        )
    }

    @action clearPreview = () => {
        this.preview = null
    }

    @computed get getPlausibleTagOptions() {
        return this.tagsStore.subSubscriptionStatus
            .filter(tag => ['home', 'all', 'feed'].indexOf(tag) === -1)
            .map(tag => ({
                value: tag,
                label: `#${tag}`,
            }))
    }

    get subFields() {
        return {
            name: 'sub',
            label: 'Sub',
            placeholder: 'Select a sub',
            rules: 'required',
            type: 'dropdown',
            hideLabels: true,
            extra: {
                options: this.getPlausibleTagOptions,
            },
        }
    }

    @task.resolved
    @action.bound
    async handleSubmit(form) {
        this.posting = true
        if (!form.hasError && this.newPostTag.value) {
            this.posting = true
            const post = form.values()
            const uuid = generateUuid()
            const posterName = this.authStore.posterName
            const uidw = this.authStore.activeUidWalletKey

            let inlineTags = post.content.match(/#([^\s.,;:!?]+)/gi)
            let tags = [this.newPostTag.value]

            if (inlineTags && inlineTags.length) {
                inlineTags = inlineTags.map(tag => tag.replace('#', ''))
                tags = [...tags, ...inlineTags]
            }

            const value = 1
            const { postPriv, activePublicKey } = this.authStore
            const { data: vote } = generateVoteObject({
                uuid,
                postPriv,
                value,
            })

            const newPost = {
                poster: null,
                displayName: null,
                title: post.title,
                content: post.content,
                sub: this.newPostTag.value,
                chain: 'eos',
                mentions: [],
                tags: tags,
                uuid: uuid,
                parentUuid: '',
                threadUuid: uuid,
                attachment: getAttachmentValue(post),
                createdAt: Date.now(),
                uidw: uidw,
                vote: vote,
            }

            if (posterName === this.authStore.displayName.bk) {
                newPost.poster = undefined
                newPost.displayName = posterName
            }

            if (posterName === this.authStore.displayName.scatter) {
                newPost.poster = posterName
                newPost.displayName = posterName
            }

            const model = new PostModel(newPost as any)
            const signedReply = model.sign(this.authStore.postPriv)
            const submittedPost = await discussions.post(signedReply as any)
            const isPostValid = discussions.checkIfPostIsValid(submittedPost)

            return new Promise((resolve, reject) => {
                if (isPostValid) {
                    const id = encodeId(submittedPost)

                    const int = setInterval(async () => {
                        const getThread = await discussions.getThread(id, activePublicKey)
                        if (getThread) {
                            if (int) {
                                clearInterval(int)
                                const newId = encodeId(getThread.openingPost as any)
                                this.userStore.toggleThreadWatch(newId, 0, true)
                                this.posting = false
                                await pushToThread(submittedPost)
                                this.uiStore.showToast('Your post has been created!', 'success')
                                this.clearPreview()
                                resolve()
                            }
                        }
                    }, 2000)
                } else {
                    this.uiStore.showToast('Unable to verify post was created.!', 'error')
                    this.posting = false
                    reject()
                }
            })
        } else {
            this.posting = false
        }
    }

    @computed get newPostForm() {
        return new CreateForm({}, [
            {
                name: 'title',
                label: `Title`,
                placeholder: 'Enter a post title',
                rules: 'required|string|min:5|max:300',
                hideLabels: true,
                autoComplete: 'off',
            },
            {
                name: 'content',
                label: 'Content',
                hideLabels: true,
                placeholder: 'Enter your content',
                type: 'richtext',
                rules: 'required',
                autoComplete: 'off',
            },
            {
                name: 'buttons',
                type: 'button',
                hideLabels: true,
                extra: {
                    options: [
                        {
                            value: 'Preview',
                            className: 'white bg-gray',
                            title: 'Preview the post before submitting',
                            disabled: !this.newPostTag,
                            onClick: form => {
                                if (!form.hasError) {
                                    this.preview = form.values()
                                    this.preview.sub = this.newPostTag
                                }
                            },
                        },
                        {
                            value: 'Post',
                            disabled: !this.authStore.hasAccount || !this.newPostTag,
                            title: !this.authStore.hasAccount
                                ? 'You need to be logged in to post'
                                : 'Post as ' + this.authStore.posterName,

                            onClick: this.handleSubmit,
                        },
                    ],
                },
            },
        ])
    }
}

export const getPostsStore = getOrCreateStore('postsStore', PostsStore)
