import { action, computed, observable } from 'mobx'
import { discussions, Thread } from '@novuspherejs/index'
import { task } from 'mobx-task'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { CreateForm } from '@components'
import { getTagStore } from '@stores/tag'
import { getAuthStore, IStores } from '@stores/index'
import { generateUuid, sleep, getAttachmentValue } from '@utils'

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
    @observable posts: IPost[] = []
    @observable preview: IPreviewPost | null = null

    /**
     * Active thread
     */
    @observable activeThreadId = ''
    // TODO: Use model
    activeThread = observable.box<Thread>(null)

    /**
     * Manage replies within a post (not opening post)
     */
    @observable replyingPostUUID = '' // which post the user is currently replying to
    @observable replyingPostContent = '' // which post the user is currently replying to

    /**
     * Manage replies of the opening post
     */
    @observable openingPostReplyOpen = true // by default leave it open
    @observable openingPostReplyContent = ''

    private tagsStore: IStores['tagStore']
    private authStore: IStores['authStore']

    constructor(props) {
        super(props)
        this.tagsStore = getTagStore()
        this.authStore = getAuthStore()
    }

    /**
     * START
     * Active thread getters used to update boxed values
     */
    @computed get getActiveThread() {
        return this.activeThread.get()
    }

    @computed get threadOpeningPost() {
        if (!this.getActiveThread) return null
        return this.getActiveThread.openingPost
    }

    @computed get threadMap() {
        if (!this.getActiveThread) return null
        return this.getActiveThread.map
    }
    /**
     * END
     * Active thread getters used to update boxed values
     */

    @task.resolved getPostsByTag = async (tags: string[]) => {
        const posts = await discussions.getPostsForTags(tags)
        this.posts = posts as any
        return this.posts
    }

    @action setActiveThreadId = (id: string) => {
        this.activeThreadId = id
    }

    //  START: Manage replies within a post methods (not an opening post)

    @action clearReplyingPost = () => {
        this.replyingPostUUID = ''
        this.replyingPostContent = ''
    }

    @action setReplyingPostUUID = (id: string) => {
        // check if the user is currently posting a reply
        if (this.submitReply['state'] !== 'pending') {
            // works as a toggle
            if (this.replyingPostUUID === id) {
                this.replyingPostUUID = ''
            } else {
                this.replyingPostContent = ''
                this.replyingPostUUID = id
            }
        }
    }

    @action setReplyPostContent = (content: string) => {
        this.replyingPostContent = content
    }

    //  END: Manage replies within a post methods (not an opening post)

    //  START: Manage replies of the opening post (opening post)

    @action clearOpeningPostReply = () => {
        this.openingPostReplyContent = ''
    }

    @action setOpeningPostToggle = () => {
        this.openingPostReplyOpen = !this.openingPostReplyOpen
    }

    @action setOpeningPostContent = (content: string) => {
        this.openingPostReplyContent = content
    }

    @task.resolved({ error: Error('Something went wrong, please try again.') })
    public submitReply = async (replyingToUid: string) => {
        try {
            if (!this.openingPostReplyContent) {
                throw Error('Post cannot be empty')
            }

            const post = this.threadMap[replyingToUid]
            const threadId = this.threadOpeningPost.uuid
            const generatedUid = generateUuid()

            // const newPost = await discussions.post({
            //     poster: this.authStore.accountName,
            //     title: '',
            //     content: this.openingPostReplyContent,
            //     sub: post.sub,
            //     chain: 'eos',
            //     mentions: [],
            //     tags: [post.sub],
            //     uuid: generatedUid,
            //     parentUuid: replyingToUid,
            //     threadUuid: threadId,
            //     attachment: getAttachmentValue(post),
            // } as any)

            // TODO: Use model for this
            const newPost = {
                poster: this.authStore.accountName,
                title: '',
                content: this.openingPostReplyContent,
                sub: post.sub,
                chain: 'eos',
                mentions: [],
                id: generatedUid,
                tags: [post.sub],
                uuid: generatedUid,
                parentUuid: replyingToUid,
                threadUuid: threadId,
                upvotes: 0,
                downvotes: 0,
                attachment: getAttachmentValue(post),
            } as any

            console.log({ [generatedUid]: newPost})

            this.updateActiveThread({
                map: {
                    ...this.threadMap,
                    [generatedUid]: newPost,
                }
            })
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    //  END: Manage replies of the opening post (opening post)

    @task
    public fetchPost = async () => {
        try {
            const thread = await discussions.getThread(this.activeThreadId)
            this.activeThread.set(thread)
        } catch (error) {
            throw error
        }
    }

    @action updateActiveThread = update => {
        this.activeThread.set({
            uuid: this.getActiveThread.uuid,
            totalReplies: this.getActiveThread.totalReplies,
            map: this.threadMap,
            openingPost: this.threadOpeningPost,
            ...update,
        } as any)
    }

    @action
    public vote = async (uuid: string, type: string, value: number) => {
        try {
            if (this.authStore.isLoggedIn) {
                await discussions.vote(uuid, value)

                // set result in opening post
                if (uuid === this.threadOpeningPost['uuid']) {
                    this.updateActiveThread({
                        openingPost: { ...this.threadOpeningPost, [type]: value },
                    })
                }

                // also set the result in the map
                this.updateActiveThread({
                    map: {
                        [uuid]: { ...this.threadMap[uuid], [type]: value },
                    },
                })
            }
        } catch (error) {
            throw error
        }
    }

    @action clearPreview = () => {
        this.preview = null
    }

    get newPostForm() {
        return new CreateForm({}, [
            {
                name: 'title',
                label: `Title`,
                placeholder: 'Enter a post title',
                rules: 'required|string|min:5|max:45',
            },
            {
                name: 'sub',
                label: 'Sub',
                placeholder: 'Select a sub',
                rules: 'required',
                type: 'dropdown',
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
            },
            {
                name: 'content',
                label: 'Content',
                placeholder: 'Enter your content',
                // rules: 'required',
                type: 'richtext',
            },
            {
                name: 'attachmentType',
                type: 'radiogroup',
                value: 'No Attachment',
                extra: {
                    options: [
                        {
                            value: 'No Attachment',
                            onClick: ({ form }) => {
                                form.$('urlType').$extra.render = false
                                form.$('hash').$extra.render = false
                                form.$('txidType').$extra.render = false

                                // reset values
                                form.$('urlType').value = ''
                                form.$('hash').value = ''
                                form.$('txidType').value = ''
                            },
                        },
                        {
                            value: 'URL',
                            onClick: ({ form }) => {
                                form.$('urlType').$extra.render = true
                                form.$('hash').$extra.render = true
                                form.$('txidType').$extra.render = false
                            },
                        },
                        {
                            value: 'IPFS',
                            onClick: ({ form }) => {
                                form.$('urlType').$extra.render = true
                                form.$('hash').$extra.render = true
                                form.$('txidType').$extra.render = false
                            },
                        },
                        {
                            value: 'TXID',
                            onClick: ({ form }) => {
                                form.$('urlType').$extra.render = false
                                form.$('hash').$extra.render = true
                                form.$('txidType').$extra.render = true
                            },
                        },
                    ],
                },
            },
            {
                name: 'urlType',
                type: 'radiogroup',
                extra: {
                    render: false,
                    options: [
                        {
                            value: 'link',
                        },
                        {
                            value: 'iframe',
                        },
                        {
                            value: 'mp4',
                        },
                        {
                            value: 'mp3',
                        },
                    ],
                },
            },
            {
                name: 'txidType',
                type: 'radiogroup',
                extra: {
                    render: false,
                    options: [
                        {
                            value: 'referendum',
                        },
                    ],
                },
            },
            {
                name: 'hash',
                label: 'Hash',
                placeholder: 'IPFS Hash / URL / TXID',
                extra: {
                    render: false,
                },
            },
            {
                name: 'buttons',
                type: 'button',
                extra: {
                    options: [
                        {
                            value: 'Post',
                            disabled: !this.authStore.isLoggedIn,
                            title: !this.authStore.isLoggedIn
                                ? 'You need to be logged in to post'
                                : 'Post with your logged as ' + this.authStore.accountName,
                            onClick: task.resolved(async form => {
                                const post = form.values()
                                const uuid = generateUuid()
                                await discussions.post({
                                    poster: this.authStore.accountName,
                                    title: post.title,
                                    content: post.content,
                                    sub: post.sub.value,
                                    chain: 'eos',
                                    mentions: [],
                                    tags: [post.sub.value],
                                    uuid: uuid,
                                    parentUuid: '',
                                    threadUuid: uuid,
                                    attachment: getAttachmentValue(post),
                                } as any)

                                this.clearPreview()
                            }),
                        },
                        {
                            value: 'Post ID',
                            title: 'Post with an anonymous ID',
                        },
                        {
                            value: 'Preview',
                            className: 'white bg-gray',
                            title: 'Preview the post before submitting',
                            onClick: form => {
                                if (form.isValid) {
                                    this.preview = form.values()
                                }
                            },
                        },
                    ],
                },
            },
        ])
    }
}

export const getPostsStore = getOrCreateStore('postsStore', Posts)
