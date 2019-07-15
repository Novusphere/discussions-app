import Thread from '@novuspherejs/discussions/thread'
import { Post } from '@novuspherejs/discussions/post'
import { action, computed, observable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { ReplyModel } from '@models/replyModel'
import _ from 'lodash'
import { discussions } from '@novuspherejs'

export class ThreadModel {
    @observable map: { [p: string]: Post }
    @observable openingPost: Post
    @observable uuid: string
    @observable title: string
    @observable totalReplies: number

    public replyBoxStatuses = observable.map<string, ReplyModel>()
    /**
     * Get the reply box model for a particular post uid
     * @return {ReplyModel}
     */
    rbModel: (...args: any[]) => ReplyModel = computedFn(
        (post: Post): ReplyModel => {
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
     * @return {Post[]}
     */
    getRepliesFromMap: (...args: any[]) => Post[] = computedFn((uid: string): Post[] => {
        if (this.map[uid]) {
            return _.filter(this.map, post => post.parentUuid === uid)
        }

        return []
    })

    /**
     * Reply box open status for a particular post id
     */
    constructor(thread: Thread | ThreadModel) {
        this.openingPost = thread.openingPost
        this.map = thread.map
        this.uuid = thread.uuid
        this.title = thread.title
        this.totalReplies = thread.totalReplies

        /**
         * Set reply box open for the opening post by default
         */
        const openingPostReplyModel = new ReplyModel(this.openingPost, this.map)
        openingPostReplyModel.toggleOpen()
        this.replyBoxStatuses.set(this.uuid, openingPostReplyModel)
    }

    @computed get openingPostReplies(): any[] {
        const openingPostReplies = this.getRepliesFromMap(this.uuid)

        return openingPostReplies.map(reply => ({
            ...reply,
            replies: this.getRepliesFromMap(reply.uuid),
        }))
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
            // opening post
            if (uuid === this.uuid) {
                if (this.openingPost.myVote === 0) {
                    this.openingPost[type] = this.openingPost[type] + myNewVote
                    this.openingPost.myVote = myNewVote
                } else if (this.openingPost.myVote === 1) {
                    this.openingPost['upvotes'] = this.openingPost['upvotes'] - 1
                    this.openingPost.myVote = 0
                } else if (this.openingPost.myVote === -1) {
                    this.openingPost['downvotes'] = this.openingPost['downvotes'] + 1
                    this.openingPost.myVote = 0
                }
            }

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

            await discussions.vote(uuid, myNewVote)
        } catch (error) {
            throw error
        }
    }
}
