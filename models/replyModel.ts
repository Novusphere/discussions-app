import { action, observable } from 'mobx'
import { task } from 'mobx-task'
import { Post } from '@novuspherejs/discussions/post'
import { Messages } from '@globals'
import { generateUuid, getAttachmentValue, sleep } from '@utils'
import { getPostsStore, getAuthStore } from '@stores'
import { discussions, Thread } from '@novuspherejs'
import { ThreadModel } from '@models/threadModel'

export class ReplyModel {
    @observable uid = ''
    @observable content = ''
    @observable open = false
    @observable map: { [p: string]: Post }

    // the post replying to
    @observable post: Post = null

    constructor(post: Thread | ThreadModel | Post, map: { [p: string]: Post }) {
        this.uid = post.uuid
        this.map = map
    }

    @action setContent = (content: string) => {
        this.content = content
    }

    @action clearContent = () => {
        this.content = ''
    }

    @task.resolved onSubmit = async () => {
        // post being replied to is the openingPost
        let post: Post
        if (!this.post) {
            post = this.map[this.uid]
        }

        if (!this.content) {
            throw Error(Messages.ERROR.POST_EMPTY)
        }

        const generatedUid = generateUuid()

        const reply = {
            poster: getAuthStore().accountName,
            title: '',
            content: this.content,
            sub: post.sub,
            chain: 'eos',
            mentions: [],
            tags: [post.sub],
            id: generatedUid,
            uuid: generatedUid,
            parentUuid: post.uuid,
            threadUuid: post.threadUuid,
            attachment: getAttachmentValue(this.content),
            upvotes: 0,
            downvotes: 0,
        }

        try {
            await discussions.post(reply as any)
            await sleep(3000)
            await getPostsStore().fetchPost()
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    @action toggleOpen = () => {
        this.open = !this.open
    }
}
