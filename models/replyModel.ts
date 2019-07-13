import { action, observable } from 'mobx'
import { task } from 'mobx-task'
import { Post } from '@novuspherejs/discussions/post'
import { Messages } from '@globals'
import { generateUuid, getAttachmentValue } from '@utils'
import { getAuthStore } from '@stores/auth'
import { IStores } from '@stores'
// import { discussions } from '@novuspherejs'

export class ReplyModel {
    private authStore: IStores['authStore']

    @observable uid = ''
    @observable content = ''
    @observable open = false
    @observable map: { [p: string]: Post }

    // the post replying to
    @observable post: Post = null

    constructor(post: Post, map: { [p: string]: Post }) {
        this.uid = post.uuid
        this.authStore = getAuthStore()
        this.map = map
    }

    @action setContent = (content: string) => {
        this.content = content
    }

    @action clearContent = () => {
        this.content = ''
    }

    @task.resolved onSubmit = async () => {
        if (!this.content) {
            throw Error(Messages.ERROR.POST_EMPTY)
        }

        const generatedUid = generateUuid()

        const reply = {
            poster: this.authStore.accountName,
            title: '',
            content: this.content,
            sub: this.post.sub,
            chain: 'eos',
            mentions: [],
            tags: [this.post.sub],
            id: generatedUid,
            uuid: generatedUid,
            parentUuid: this.post.uuid,
            threadUuid: this.post.threadUuid,
            attachment: getAttachmentValue(this.post),
            upvotes: 0,
            downvotes: 0,
        }

        try {
            console.log(this.post.content, this.post.replies.length)
            const rogueReply = {
                ...reply,
                replies: [],
            } as any
            // const post = await discussions.post(reply as any)
            this.post.replies.push(rogueReply)
            console.log(this.post.replies.length)

            Object.assign(this.map, {
                [reply.uuid]: rogueReply,
            })
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    @action toggleOpen = () => {
        this.open = !this.open
    }
}
