import { computed, observable, set } from 'mobx'
import { Post } from '@novuspherejs'
import ecc from 'eosjs-ecc'

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
    @observable replies
    @observable content

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

    sign = (privKey: string) => {
        this.pub = ecc.privateToPublic(privKey);
        const hash0 = ecc.sha256(this.content);
        const hash1 = ecc.sha256(this.uuid+hash0);
        this.sig = ecc.sign(hash1, privKey);
        this.verifySig = this.pub;
        return this
    }
}


export default PostModel
