import { action, observable } from 'mobx'
import { task } from 'mobx-task'
import { Post } from '@novuspherejs/discussions/post'
import { Messages } from '@globals'
import { generateUuid, getAttachmentValue, sleep } from '@utils'
import { getAuthStore } from '@stores/auth'
import { getPostsStore, IStores } from '@stores'
import { discussions } from '@novuspherejs'

export class ReplyModel {
    private authStore: IStores['authStore']
    private postsStore: IStores['postsStore']

    @observable uid = ''
    @observable content = ''
    @observable open = false
    @observable map: { [p: string]: Post }

    // the post replying to
    @observable post: Post = null

    constructor(post: Post, map: { [p: string]: Post }) {
        this.uid = post.uuid
        this.authStore = getAuthStore()
        this.postsStore = getPostsStore()
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
            poster: this.authStore.accountName,
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
            await this.postsStore.fetchPost()
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    @action toggleOpen = () => {
        this.open = !this.open
    }
}
