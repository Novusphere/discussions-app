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
        this.replyBoxStatuses.set(this.uuid, new ReplyModel(this.uuid))
    }

    /**
     * Get the reply box model for a particular post uid
     */
    getReplyBoxModel: (...args: any[]) => ReplyModel = computedFn(
        (uid: string): ReplyModel => {
            if (this.replyBoxStatuses.has(uid)) {
                return this.replyBoxStatuses.get(uid)
            }
            const model = new ReplyModel(uid)
            this.replyBoxStatuses.set(uid, model)
            return model
        }
    )

    /**
     * See if a reply box is open for a particular post id
     */
    isReplyBoxOpen = computedFn((uid: string): boolean => {
        if (this.replyBoxStatuses.has(uid)) {
            const model = this.replyBoxStatuses.get(uid)
            return model.open
        }
        return false
    })

    /**
     * Toggle the status of the reply box
     * @param {string} uid
     */
    toggleReplyBoxStatus = (uid: string) => {
        let replyModel: ReplyModel

        if (this.replyBoxStatuses.has(uid)) {
            replyModel = this.replyBoxStatuses.get(uid)
            replyModel.toggleOpen()
            this.replyBoxStatuses.set(uid, replyModel)
        } else {
            this.replyBoxStatuses.set(uid, new ReplyModel(uid))
        }
    }

    @computed get replies(): Post[] {
        const replies = []

        Object.keys(this.map).map(post => {
            if (post === this.uuid && this.map[post].parentUuid === this.uuid) {
                return null
            }
            replies.push(this.map[post])
        })

        return replies
    }
}
