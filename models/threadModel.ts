import Thread from '@novuspherejs/discussions/thread'
import { Post } from '@novuspherejs/discussions/post'
import { action, computed, observable, set } from 'mobx'
import { ReplyModel } from '@models/replyModel'
import _ from 'lodash'
import PostModel from '@models/postModel'
import { CreateForm } from '@components'
import { getAuthStore, getUiStore, IStores } from '@stores'
import { task } from 'mobx-task'
import EditModel from '@models/editModel'
import { generateVoteObject, voteAsync } from '@utils'

export class ThreadModel {
    @observable public map: { [p: string]: PostModel } | undefined
    @observable.deep public openingPost: PostModel
    @observable public uuid: string
    @observable public title: string
    @observable public sub: string

    @observable openingPostReplies: PostModel[] = []

    @observable editing = false
    @observable openingPostReplyModel: ReplyModel = null

    public replyBoxStatuses = observable.map<string, ReplyModel>()

    private readonly authStore: IStores['authStore'] = getAuthStore()
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
        if (!form.hasError) {
            const { title, content } = form.values()
            const { postPriv, posterType, posterName } = this.authStore
            const cached = this.openingPost

            try {
                const editModel = new EditModel({
                    content: content,
                    title: title,
                    posterName: posterName,
                    posterType: posterType,
                    postPriv: postPriv,
                    cached: cached,
                })

                const response = await editModel.submitEdits()

                if (!response) {
                    this.openingPost.title = cached.title
                    this.openingPost.content = cached.content
                    this.uiStore.showToast('There was an error editing your post', 'error')
                    return
                }

                set(this.openingPost, response)

                this.openingPost.editedAt = new Date(Date.now())
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
        console.log(uuid, myNewVote)
        const type = myNewVote === 1 ? 'upvotes' : 'downvotes'
        const post = this.map[uuid]
        const updatedVote = post[type] + myNewVote

        // const internallyUpdateVote = _myNewVote => {
        //     // opening post
        //     if (uuid === this.uuid) {
        //         if (this.openingPost['myVote'] === 0) {
        //             this.openingPost[type] = updatedVote
        //             this.openingPost['myVote'] = _myNewVote
        //         } else if (this.openingPost['myVote'] === 1) {
        //             this.openingPost['upvotes'] = this.openingPost['upvotes'] - 1
        //             this.openingPost['myVote'] = 0
        //         } else if (this.openingPost['myVote'] === -1) {
        //             this.openingPost['downvotes'] = this.openingPost['downvotes'] + 1
        //             this.openingPost['myVote'] = 0
        //         }
        //     }
        //
        //     if (this.map) {
        //         if (this.map[uuid].myVote === 0) {
        //             this.map[uuid][type] = updatedVote
        //             this.map[uuid].myVote = _myNewVote
        //         } else if (this.map[uuid].myVote === 1) {
        //             this.map[uuid]['upvotes'] = this.map[uuid]['upvotes'] - 1
        //             this.map[uuid].myVote = 0
        //         } else if (this.map[uuid].myVote === -1) {
        //             this.map[uuid]['downvotes'] = this.map[uuid]['downvotes'] + 1
        //             this.map[uuid].myVote = 0
        //         }
        //     }
        // }

        try {
            // internallyUpdateVote(myNewVote)

            const { postPriv } = this.authStore
            const value = myNewVote

            const voteObject = generateVoteObject({
                uuid,
                postPriv,
                value,
            })

            const data = await voteAsync({
                voter: '',
                uuid,
                value,
                nonce: voteObject.nonce,
                pub: voteObject.pub,
                sig: voteObject.sig,
            })

            if (data.error) {
                // internallyUpdateVote(post[type])
                this.uiStore.showToast(`Failed to ${type.split('s')[0]} this post`, 'error')
            }

            return {
                myVote: myNewVote,
                downvotes: post.downvotes,
                upvotes: post.upvotes,
                type: type,
            }

        } catch (error) {
            console.log(error)
            // internallyUpdateVote(post[type])
            throw error
        }
    }
}
