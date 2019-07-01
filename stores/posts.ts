import { action, observable } from 'mobx'
import { discussions } from '@novuspherejs/index'
import { task } from 'mobx-task'
import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { CreateForm } from '@components'
import { getTagStore } from '@stores/tag'
import { IStores } from '@stores/index'

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

    private tagsStore: IStores['tagStore']

    constructor(props) {
        super(props)
        this.tagsStore = getTagStore()
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

    get newPostForm() {
        return new CreateForm(
            {
                onSuccess: form => {
                    console.log(form)
                },
            },
            [
                {
                    name: 'title',
                    label: `Title`,
                    placeholder: 'Enter a post title',
                    rules: 'required|string',
                },
                {
                    name: 'Sub',
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
            ]
        )
    }
}

export const getPostsStore = getOrCreateStore('postsStore', Posts)
