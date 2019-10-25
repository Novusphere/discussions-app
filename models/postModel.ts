import { computed, observable, set } from 'mobx'
import { Post } from '@novuspherejs'

class PostModel {
    @observable public map: { [p: string]: PostModel } | undefined
    @observable parentUuid
    @observable threadUuid
    @observable sub
    @observable uuid
    @observable title
    @observable poster
    @observable displayName
    @observable createdAt
    @observable myVote
    @observable upvotes
    @observable downvotes
    @observable attachment
    @observable content
    @observable replies

    @observable transaction

    @observable verifySig
    @observable sig
    @observable pub

    constructor(post: Post) {
        set(this, post)
    }

    @computed get posterName() {
        if (this.displayName) {
            return this.displayName
        }
        return this.poster
    }

    sign = (privateKey: string) => {
        const _post = new Post(this as any)
        _post.sign(privateKey)
        this.verifySig = _post['verifySig']
        this.sig = _post['sig']
        this.pub = _post['pub']
        return this
    }
}


export default PostModel
