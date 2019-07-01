import { action, observable } from 'mobx'
import { discussions } from '@novuspherejs/index'
import { task } from 'mobx-task'
import {BaseStore, getOrCreateStore} from 'next-mobx-wrapper';

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
    votes: number
    alreadyVoted: boolean
}

export default class Posts extends BaseStore {
    // all posts by filter
    @observable posts: IPost[] = []

    @observable activePostId = ''
    constructor() {
        super()
        this.fetchPost = this.fetchPost.bind(this)
    }

    @action getPostsByTag = (tags: string[]) => {
        discussions.getPostsForTags(tags).then(data => {
            this.posts = (data as unknown) as IPost[]
        })
    }

    @action setActivePostId = (id: string) => {
        this.activePostId = id
    }

    @task
    public fetchPost = async () => {
        try {
            return await discussions.getThread('', Number(this.activePostId))
        } catch (error) {
            throw error
        }
    }
}

export const getPostsStore = getOrCreateStore('postsStore', Posts)
