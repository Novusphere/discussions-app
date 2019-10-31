import { computed, observable, set } from 'mobx'
import { Post } from '@novuspherejs'

class FeedModel {
    @observable title: string
    @observable upvotes: number
    @observable downvotes: number
    @observable myVote: number
    @observable parentUuid: string

    @observable verifySig: any
    @observable uuid: any
    @observable map: any
    @observable sub: any
    @observable poster: any
    @observable displayName: any
    @observable totalReplies: any
    @observable content: any
    @observable createdAt: any

    constructor(post: Post) {
        set(this, post)
    }

    vote = async (_uuid: string, myNewVote: number) => {
        const type = myNewVote === 1 ? 'upvotes' : 'downvotes'

        if (this.myVote === 0) {
            this[type] = this[type] + myNewVote
            this.myVote = myNewVote
        } else if (this.myVote === 1) {
            this.upvotes = this.upvotes - 1
            this.myVote = 0
        } else if (this.myVote === -1) {
            this.downvotes = this.downvotes + 1
            this.myVote = 0
        }
    }
}

export default FeedModel
