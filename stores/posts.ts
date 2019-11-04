import { action, computed, observable } from 'mobx'
import { discussions, Post } from '@novuspherejs'
import { task } from 'mobx-task'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { CreateForm } from '@components'
import { getTagStore } from '@stores/tag'
import { getNewAuthStore, getUiStore, IStores } from '@stores'
import { generateUuid, getAttachmentValue, getIdenticon, pushToThread, sleep } from '@utils'
import { ThreadModel } from '@models/threadModel'
import FeedModel from '@models/feedModel'
import _ from 'lodash'

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

export default class Posts extends BaseStore {
    // all posts by filter
    @observable posts: Post[] = []

    @observable postsPosition = {
        items: 0,
        cursorId: undefined,
    }

    @observable preview: IPreviewPost | null = null

    @observable activeThreadId = ''

    // when creating a new post
    @observable newPostData = {
        sub: { value: '', label: '' },
    }

    /**
     * Manage getRepliesFromMap within a post (not opening post)
     */
    @observable replyingPostUUID = '' // which post the user is currently replying to
    @observable replyingPostContent = '' // which post the user is currently replying to

    /**
     * Manage getRepliesFromMap of the opening post
     */
    @observable openingPostReplyContent = ''

    @observable activeThread: ThreadModel | null = null

    @observable currentHighlightedPostUuid = ''

    private tagsStore: IStores['tagStore']
    private uiStore: IStores['uiStore']
    private newAuthStore: IStores['newAuthStore']

    constructor(props) {
        super(props)
        this.tagsStore = getTagStore()
        this.uiStore = getUiStore()
        this.newAuthStore = getNewAuthStore()

        // refresh posts on logged in
        // so we can show upvotes/downvotes by the user
        // reaction(
        //     () => this.newAuthStore.hasAccount,
        //     async hasAccount => {
        //         if (hasAccount) {
        //             if (this.activeThread) {
        //                 this.getAndSetThread(this.activeThreadId)
        //             }
        //         }
        //     }
        // )
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

    @task getPostsByTag = async (tags: string[]) => {
        try {
            const { posts, cursorId } = await discussions.getPostsForTags(
                tags,
                this.postsPosition.cursorId,
                this.postsPosition.items
            )
            this.posts = [...this.posts, ...posts]
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
    public async getAndSetThread(id: string) {
        try {
            const thread = await this.getThreadById(id)
            if (!thread) return null
            this.activeThread = thread
            this.activeThreadId = id
            return this.activeThread
        } catch (error) {
            console.log('Class: Posts, Function: getAndSetThread, Line 123 error: ', error)
            throw error
        }
    }

    @action.bound
    refreshActiveThreadAsModel() {
        this.activeThread = new ThreadModel(this.activeThread as any)
        return this.activeThread
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

                let imageData = getIdenticon()

                if (posts.pub && posts.pub.length) {
                    imageData = getIdenticon(posts.pub)
                }

                return {
                    id: posts.pub,
                    value: poster,
                    icon: imageData,
                }
            }),
            option => option.id
        )
    }

    @task
    public getThreadById = async (id: string): Promise<ThreadModel | null> => {
        try {
            const thread = await discussions.getThread(id)
            if (!thread) return null
            return new ThreadModel(thread)
        } catch (error) {
            throw error
        }
    }

    @action
    public vote = async (uuid: string, value: number) => {
        try {
            if (this.newAuthStore.hasAccount) {
                await this.activeThread.vote(uuid, value)
            }
        } catch (error) {
            throw error
        }
    }

    @action clearPreview = () => {
        this.preview = null
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
                options: [
                    { value: 'all', label: 'all' },
                    ...Array.from(this.tagsStore.tags.values())
                        .filter(tag => !tag.root)
                        .map(tag => ({
                            value: tag.name,
                            label: tag.name,
                        })),
                ],
            },
        }
    }

    get newPostForm() {
        return new CreateForm({}, [
            {
                name: 'title',
                label: `Title`,
                placeholder: 'Enter a post title',
                rules: 'required|string|min:5|max:45',
                hideLabels: true,
            },
            // {
            //     name: 'sub',
            //     label: 'Sub',
            //     placeholder: 'Select a sub',
            //     rules: 'required',
            //     type: 'dropdown',
            //     hideLabels: true,
            //     extra: {
            //         options: [
            //             { value: 'all', label: 'all' },
            //             ...Array.from(this.tagsStore.tags.values())
            //                 .filter(tag => !tag.root)
            //                 .map(tag => ({
            //                     value: tag.name,
            //                     label: tag.name,
            //                 })),
            //         ],
            //     },
            // },
            {
                name: 'content',
                label: 'Content',
                hideLabels: true,
                placeholder: 'Enter your content',
                // rules: 'required',
                type: 'richtext',
            },
            // {
            //     name: 'attachmentType',
            //     type: 'radiogroup',
            //     value: 'No Attachment',
            //     hideLabels: true,
            //     extra: {
            //         options: [
            //             {
            //                 value: 'No Attachment',
            //                 onClick: ({ form }) => {
            //                     form.$('urlType').$extra.render = false
            //                     form.$('hash').$extra.render = false
            //                     form.$('txidType').$extra.render = false
            //
            //                     // reset values
            //                     form.$('urlType').value = ''
            //                     form.$('hash').value = ''
            //                     form.$('txidType').value = ''
            //                 },
            //             },
            //             {
            //                 value: 'URL',
            //                 onClick: ({ form }) => {
            //                     form.$('urlType').$extra.render = true
            //                     form.$('hash').$extra.render = true
            //                     form.$('txidType').$extra.render = false
            //                 },
            //             },
            //             {
            //                 value: 'IPFS',
            //                 onClick: ({ form }) => {
            //                     form.$('urlType').$extra.render = true
            //                     form.$('hash').$extra.render = true
            //                     form.$('txidType').$extra.render = false
            //                 },
            //             },
            //             {
            //                 value: 'TXID',
            //                 onClick: ({ form }) => {
            //                     form.$('urlType').$extra.render = false
            //                     form.$('hash').$extra.render = true
            //                     form.$('txidType').$extra.render = true
            //                 },
            //             },
            //         ],
            //     },
            // },
            // {
            //     name: 'urlType',
            //     type: 'radiogroup',
            //     extra: {
            //         render: false,
            //         options: [
            //             {
            //                 value: 'link',
            //             },
            //             {
            //                 value: 'iframe',
            //             },
            //             {
            //                 value: 'mp4',
            //             },
            //             {
            //                 value: 'mp3',
            //             },
            //         ],
            //     },
            // },
            // {
            //     name: 'txidType',
            //     type: 'radiogroup',
            //     extra: {
            //         render: false,
            //         options: [
            //             {
            //                 value: 'referendum',
            //             },
            //         ],
            //     },
            // },
            // {
            //     name: 'hash',
            //     label: 'Hash',
            //     placeholder: 'IPFS Hash / URL / TXID',
            //     extra: {
            //         render: false,
            //     },
            // },
            {
                name: 'buttons',
                type: 'button',
                hideLabels: true,
                extra: {
                    options: [
                        // {
                        //     value: 'Preview',
                        //     className: 'white bg-gray',
                        //     title: 'Preview the post before submitting',
                        //     onClick: form => {
                        //         if (form.isValid) {
                        //             console.log(this.newPostData)
                        //             // this.preview = form.values()
                        //             // this.preview.sub = {
                        //             //     value: this.newPostData.sub,
                        //             //     label: this.newPostData.sub,
                        //             // }
                        //         }
                        //     },
                        // },
                        {
                            value: 'Post ID',
                            title: 'Post with an anonymous ID',
                        },
                        {
                            value: 'Post',
                            disabled: !this.newAuthStore.hasAccount,
                            title: !this.newAuthStore.hasAccount
                                ? 'You need to be logged in to post'
                                : 'Post with your logged as ' + this.newAuthStore.posterName,

                            onClick: task.resolved(async form => {
                                if (!form.hasError && this.newPostData.sub.value) {
                                    const post = form.values()
                                    const uuid = generateUuid()
                                    const posterName = this.newAuthStore.posterName

                                    const newPost = {
                                        poster: null,
                                        displayName: null,
                                        title: post.title,
                                        content: post.content,
                                        sub: this.newPostData.sub.value,
                                        chain: 'eos',
                                        mentions: [],
                                        tags: [this.newPostData.sub.value],
                                        uuid: uuid,
                                        parentUuid: '',
                                        threadUuid: uuid,
                                        attachment: getAttachmentValue(post),
                                        createdAt: Date.now(),
                                    }

                                    if (posterName === this.newAuthStore.displayName.bk) {
                                        newPost.poster = undefined
                                        newPost.displayName = posterName
                                    }

                                    if (posterName === this.newAuthStore.displayName.scatter) {
                                        newPost.poster = posterName
                                        newPost.displayName = posterName
                                    }

                                    const submittedPost = await discussions.post(newPost as any)

                                    // TODO: Add check to make sure the thread is actually posted onto the chain
                                    await sleep(5000)

                                    pushToThread(submittedPost)

                                    this.uiStore.showToast('Your post has been created!', 'success')

                                    this.clearPreview()
                                }
                            }),
                        },
                    ],
                },
            },
        ])
    }
}

export const getPostsStore = getOrCreateStore('postsStore', Posts)
