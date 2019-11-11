import Thread from '@novuspherejs/discussions/thread'
import { Post } from '@novuspherejs/discussions/post'
import { action, computed, observable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { ReplyModel } from '@models/replyModel'
import _ from 'lodash'
import PostModel from '@models/postModel'
import { discussions } from '@novuspherejs'
import { getNewAuthStore, getUiStore, IStores } from '@stores'
import CreateForm from '../components/create-form/create-form'
import { task } from 'mobx-task'

export class ThreadModel {
    @observable public map: { [p: string]: PostModel } | undefined
    @observable.deep public openingPost: PostModel
    @observable public uuid: string
    @observable public title: string
    @observable public sub: string

    @observable public replies: PostModel[]

    @observable editing = false

    public replyBoxStatuses = observable.map<string, ReplyModel>()

    private readonly authStore: IStores['newAuthStore'] = getNewAuthStore()
    private readonly uiStore: IStores['uiStore'] = getUiStore()

    /**
     * ReplyBox box open status for a particular post id
     */
    constructor(thread: Thread) {
        if (!(thread instanceof Post) || thread instanceof Thread) {
            this.openingPost = new PostModel(thread.openingPost)
            this.uuid = thread.openingPost.uuid

            const map = {}

            Object.keys(thread.map).map(id => {
                map[id] = new PostModel(thread.map[id])
            })

            this.map = map
            this.title = thread.openingPost.title
            this.sub = thread.openingPost.sub
        } else {
            this.openingPost = thread
            this.uuid = thread!.uuid
            this.title = thread!.title
        }

        /**
         * Set reply box open for the opening post by default
         */
        const openingPostReplyModel = new ReplyModel(this.openingPost, this.map)
        openingPostReplyModel.toggleOpen()
        this.replyBoxStatuses.set(this.uuid, openingPostReplyModel)
    }

    @computed get canEditPost() {
        return this.openingPost.pub === this.authStore.activePublicKey
    }

    @computed get totalReplies() {
        const map = Object.keys(this.map)

        if (map.length) {
            return map.length - 1
        }

        return 0
    }

    @action.bound
    toggleEditing(overwriteValue?: boolean) {
        if (overwriteValue) {
            this.editing = overwriteValue
            return
        }

        this.editing = !this.editing
    }

    @task.resolved
    @action.bound
    async saveEdits(form) {
        const cached = this.openingPost

        if (!form.hasError) {
            const { title, content } = form.values()

            try {
                this.openingPost.title = title
                this.openingPost.content = content

                let signedEdit = await this.openingPost.sign(this.authStore.postPriv)

                signedEdit['parentUuid'] = this.openingPost.uuid
                signedEdit['edit'] = true
                signedEdit['poster'] = undefined

                this.openingPost = await discussions.post(signedEdit as any)
                this.uiStore.showToast('Your post has been edited!', 'success')

                this.toggleEditing()
            } catch (error) {
                this.openingPost.title = cached.title
                this.openingPost.content = cached.content
                this.uiStore.showToast('There was an error editing your post', 'error')
            }
        }
    }

    get editForm() {
        return new CreateForm({}, [
            {
                name: 'title',
                label: 'title',
                hideLabels: true,
                value: this.openingPost.title,
            },
            {
                name: 'content',
                label: 'Content',
                value: this.openingPost.content,
                hideLabels: true,
                type: 'richtext',
            },
            {
                name: 'buttons',
                type: 'button',
                hideLabels: true,
                extra: {
                    options: [
                        {
                            value: 'Cancel',
                            className: 'white bg-red',
                            title: 'Cancel changes to your post',
                            onClick: () => {
                                this.editing = false
                            },
                        },
                        {
                            value: 'Save',
                            title: 'Save changes to your post',
                            onClick: this.saveEdits,
                        },
                    ],
                },
            },
        ])
    }

    /**
     * Get the reply box model for a particular post uid
     * @return {ReplyModel}
     */
    rbModel: (...args: any[]) => ReplyModel = computedFn(
        (post: PostModel): ReplyModel => {
            const uid = post.uuid

            if (this.replyBoxStatuses.has(uid)) {
                return this.replyBoxStatuses.get(uid)
            }

            let model: ReplyModel

            if (this.map[uid]) {
                model = new ReplyModel(this.map[uid], this.map)
            } else {
                model = new ReplyModel(post, this.map)
            }

            this.replyBoxStatuses.set(uid, model)
            return model
        }
    )
    /**
     * Get posts based on a parent uuid
     * @param {string} uid - The post uid that you want getRepliesFromMap for
     * @return {PostModel[]}
     */
    getRepliesFromMap: (...args: any[]) => PostModel[] = computedFn((uid: string): PostModel[] => {
        if (this.map[uid]) {
            return _.filter(this.map, (post, index) => post.parentUuid === uid)
        }

        return []
    })

    @computed get openingPostReplies(): any[] {
        const openingPostReplies = this.getRepliesFromMap(this.uuid)

        return openingPostReplies.map(reply => {
            return {
                ...reply,
                replies: this.getRepliesFromMap(reply.uuid),
            }
        })
    }

    /**
     * Toggle the status of the reply box
     * @param {string} uid
     * @return {void}
     */
    toggleReplyBoxStatus = (uid: string) => {
        let replyModel: ReplyModel

        if (this.replyBoxStatuses.has(uid)) {
            replyModel = this.replyBoxStatuses.get(uid)
            replyModel.toggleOpen()
            this.replyBoxStatuses.set(uid, replyModel)
        } else {
            if (this.map[uid]) {
                this.replyBoxStatuses.set(uid, new ReplyModel(this.map[uid], this.map))
            }
        }
    }

    /**
     * Set the vote of a post given it's uuid.
     * This will set a phantom vote for the user, to prevent unnecessary fetching of the post afterwards.
     * @param {string} uuid - The uuid of the post the user is voting on
     * @param {number} myNewVote - +1 (upvote), 0 (neutral), -1 (downvote)
     * @return {void}
     */
    @action vote = async (uuid: string, myNewVote: number) => {
        const type = myNewVote === 1 ? 'upvotes' : 'downvotes'

        try {
            await discussions.vote(uuid, myNewVote)

            // opening post
            if (uuid === this.uuid) {
                if (this.openingPost['myVote'] === 0) {
                    this.openingPost[type] = this.openingPost[type] + myNewVote
                    this.openingPost['myVote'] = myNewVote
                } else if (this.openingPost['myVote'] === 1) {
                    this.openingPost['upvotes'] = this.openingPost['upvotes'] - 1
                    this.openingPost['myVote'] = 0
                } else if (this.openingPost['myVote'] === -1) {
                    this.openingPost['downvotes'] = this.openingPost['downvotes'] + 1
                    this.openingPost['myVote'] = 0
                }
            }

            if (this.map) {
                if (this.map[uuid].myVote === 0) {
                    this.map[uuid][type] = this.map[uuid][type] + myNewVote
                    this.map[uuid].myVote = myNewVote
                } else if (this.map[uuid].myVote === 1) {
                    this.map[uuid]['upvotes'] = this.map[uuid]['upvotes'] - 1
                    this.map[uuid].myVote = 0
                } else if (this.map[uuid].myVote === -1) {
                    this.map[uuid]['downvotes'] = this.map[uuid]['downvotes'] + 1
                    this.map[uuid].myVote = 0
                }
            }
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}
