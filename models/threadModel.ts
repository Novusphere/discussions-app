import Thread from '@novuspherejs/discussions/thread'
import { Post } from '@novuspherejs/discussions/post'
import { computed, observable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { ReplyModel } from '@models/replyModel'

export class ThreadModel {
    @observable map: { [p: string]: Post }
    @observable openingPost: Post
    @observable uuid: string
    @observable title: string
    @observable totalReplies: number

    public replyBoxStatuses = observable.map<string, ReplyModel>()

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
     * Get only a openingPost's replies
     * @return {Post[]}
     */
    @computed get replies(): Post[] {
        const replies = []

        Object.keys(this.map).map(post => {
            if (post === this.uuid) {
                return null
            }

            if (this.map[post].parentUuid !== this.uuid) {
                return null
            }

            return replies.push(this.map[post])
        })

        return replies
    }
}
