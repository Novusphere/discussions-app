import { action, observable } from 'mobx'
import { task } from 'mobx-task'
import { Post } from '@novuspherejs/discussions/post'
import { Messages } from '../constants/globals'
import { generateUuid, getAttachmentValue } from '@utils'
import { getAuthStore } from '@stores/auth'
import { IStores } from '@stores/index'
import { discussions } from '@novuspherejs/index'

export class ReplyModel {
    private authStore: IStores['authStore']

    @observable uid = ''
    @observable content = ''
    @observable open = false
    @observable post: Post = null

    // the post replying to

    constructor(uid: string, post) {
        this.uid = uid
        this.post = post

        this.authStore = getAuthStore()
    }

    @action setContent = (content: string) => {
        this.content = content
    }

    @task.resolved onSubmit = async () => {
        if (!this.content) {
            throw Error(Messages.ERROR.POST_EMPTY)
        }

        const generatedUid = generateUuid()

        const reply = {
            createdAt: Date.now(),
            poster: this.authStore.accountName,
            title: '',
            content: this.content,
            sub: this.post.sub,
            chain: 'eos',
            mentions: [],
            tags: [this.post.sub],
            uuid: generatedUid,
            parentUuid: this.post.uuid,
            threadUuid: this.post.threadUuid,
            attachment: getAttachmentValue(this.post),
            edit: false,
            upvotes: 0,
            downvotes: 0,
        }

        await discussions.post(reply as any)
        this.post.replies.push(reply as any)
    }

    @action toggleOpen = () => {
        this.open = !this.open
    }
}
