import Thread from '@novuspherejs/discussions/thread'
import { Post } from '@novuspherejs/discussions/post'
import { action, computed, observable } from 'mobx'
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
    @observable openingPostReplies: PostModel[] = []

    @observable editing = false

    @observable openingPostReplyModel: ReplyModel = null

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
        this.openingPostReplyModel = openingPostReplyModel
        openingPostReplyModel.toggleOpen()
        this.replyBoxStatuses.set(this.uuid, openingPostReplyModel)

        this.openingPostReplies = _.filter(this.map, post => post.parentUuid === this.uuid)
    }

    @action.bound
    getRepliesFromMap(uid: string) {
        if (this.map[uid]) {
            return _.filter(this.map, post => post.parentUuid === uid)
        }

        return []
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
                let tags = ReplyModel.matchContentForTags(content)
                
                if (tags && tags.length) {
                    tags = tags.map(tag => tag.replace('#', ''))
                    tags = [...this.openingPost.tags, ...tags]
                } else {
                    tags = this.openingPost.tags
                }

                const mentions = ReplyModel.extractMentionHashesForRegEx(
                    ReplyModel.matchContentForMentions(content)
                )

                this.openingPost.content = content
                this.openingPost.title = title
                this.openingPost.tags = tags
                this.openingPost.mentions = mentions
                this.openingPost.parentUuid = this.openingPost.uuid
                this.openingPost.edit = true
                this.openingPost.poster = undefined

                let signedEdit = await this.openingPost.sign(this.authStore.postPriv)

                const newPost = await discussions.post(signedEdit as any)
                newPost.editedAt = new Date(Date.now())
                this.openingPost = new PostModel(newPost)
                this.uiStore.showToast('Your post has been edited!', 'success')
                this.toggleEditing()
            } catch (error) {
                console.error(error)
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
    @action.bound
    rbModel(post: PostModel) {
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

    /**
     * Toggle the status of the reply box
     * @param {string} uid
     * @return {void}
     */
    // toggleReplyBoxStatus = (uid: string) => {
    //     let replyModel: ReplyModel
    //
    //     if (this.replyBoxStatuses.has(uid)) {
    //         replyModel = this.replyBoxStatuses.get(uid)
    //         replyModel.toggleOpen()
    //         this.replyBoxStatuses.set(uid, replyModel)
    //     } else {
    //         if (this.map[uid]) {
    //             this.replyBoxStatuses.set(uid, new ReplyModel(this.map[uid], this.map))
    //         }
    //     }
    // }

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
