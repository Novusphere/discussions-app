import Thread from '@novuspherejs/discussions/thread'
import { Post } from '@novuspherejs/discussions/post'
import { observable } from 'mobx'
import { computedFn } from 'mobx-utils'

export class ThreadModel {
    @observable public id: string
    @observable public openingPost: Post
    @observable public map: { [p: string]: Post }

    /**
     * Reply box open status for a particular post id
     */
    public replyBoxOpen = observable.map<string, boolean>()

    constructor(thread: Thread) {
        this.id = thread.uuid
        this.openingPost = thread.openingPost
        this.map = thread.map
    }

    /**
     * See if a reply box is open for a particular post id
     */
    isReplyBoxOpen = computedFn((id: string) => {
        if (this.replyBoxOpen.has(id)) {
            return this.replyBoxOpen.get(id)
        }
        return false
    })


    /**
     * Toggle the status of the reply box
     * @param {string} id
     */
    toggleReplyBoxStatus(id: string) {
        let previousStatus

        if (this.replyBoxOpen.has(id)) {
            previousStatus = this.replyBoxOpen.get(id)
        }

        this.replyBoxOpen.set(id, !previousStatus)
    }
}
