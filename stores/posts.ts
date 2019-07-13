import { action, observable } from 'mobx'
import { discussions, Post } from '@novuspherejs'
import { task } from 'mobx-task'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { CreateForm } from '@components'
import { getTagStore } from '@stores/tag'
import { getAuthStore, IStores } from '@stores'
import { generateUuid, getAttachmentValue } from '@utils'
import { ThreadModel } from '@models/threadModel'

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
    @observable preview: IPreviewPost | null = null

    @observable activeThreadId = ''
    @observable activeThread: ThreadModel = null

    /**
     * Manage replies within a post (not opening post)
     */
    @observable replyingPostUUID = '' // which post the user is currently replying to
    @observable replyingPostContent = '' // which post the user is currently replying to

    /**
     * Manage replies of the opening post
     */
    @observable openingPostReplyContent = ''

    private tagsStore: IStores['tagStore']
    private authStore: IStores['authStore']

    constructor(props) {
        super(props)
        this.tagsStore = getTagStore()
        this.authStore = getAuthStore()
    }

    public encodeId(post: IPost) {
        return Post.encodeId(post.transaction, new Date(post.createdAt))
    }

    @task.resolved getPostsByTag = async (tags: string[]) => {
        this.posts = await discussions.getPostsForTags(tags)
        return this.posts
    }

    @action setActiveThreadId = (id: string) => {
        this.activeThreadId = id
    }

    @task
    public fetchPost = async () => {
        try {
            const thread = await discussions.getThread(this.activeThreadId)
            this.activeThread = new ThreadModel(thread)
            return this.activeThread
        } catch (error) {
            throw error
        }
    }

    @action
    // @ts-ignore
    public vote = async (uuid: string, type: string, value: number) => {
        // try {
        //     if (this.authStore.isLoggedIn) {
        //         await discussions.vote(uuid, value)
        //
        //         // set result in opening post
        //         if (uuid === this.threadOpeningPost['uuid']) {
        //             this.updateActiveThread({
        //                 openingPost: { ...this.threadOpeningPost, [type]: value },
        //             })
        //         }
        //
        //         // also set the result in the map
        //         this.updateActiveThread({
        //             map: {
        //                 [uuid]: { ...this.threadMap[uuid], [type]: value },
        //             },
        //         })
        //     }
        // } catch (error) {
        //     throw error
        // }
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
