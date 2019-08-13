import { action, observable, set } from 'mobx'
import { task } from 'mobx-task'
import { Post } from '@novuspherejs/discussions/post'
import { Messages } from '@globals'
import { generateUuid, getAttachmentValue } from '@utils'
import { getAuthStore, getPostsStore, IStores } from '@stores'
import PostModel from '@models/postModel'
import { discussions } from '@novuspherejs'

export class ReplyModel {
    @observable uid = ''
    @observable content = ''
    @observable open = false
    @observable map: { [p: string]: PostModel }

    public readonly authStore: IStores['authStore']
    public readonly postStore: IStores['postsStore']

    // the post replying to
    @observable post: Post = null

    constructor(post: PostModel, map: { [p: string]: PostModel }) {
        this.uid = post.uuid
        this.map = map
        this.authStore = getAuthStore()
        this.postStore = getPostsStore()
    }

    @action setContent = (content: string) => {
        this.content = content
    }

    @action clearContent = () => {
        this.content = ''
    }

    @task.resolved onSubmit = async () => {
        let post: PostModel

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
            const activeThread = this.postStore.activeThread

            if (activeThread) {
                const model = new PostModel(reply as any)

                const signedReply = model.sign(this.authStore.postPriv)
                const confirmedReply = await discussions.post(signedReply as any)
                console.log('Class: ReplyModel, Function: onSubmit, Line 75 confirmedReply: ', confirmedReply);

                set(activeThread, {
                    totalReplies: activeThread.totalReplies + 1,
                    map: {
                        ...activeThread.map,
                        [reply.id]: new PostModel(confirmedReply),
                    },
                })

                this.content = ''
                this.toggleOpen()
            }

            // await discussions.post.sign(this.authStore.postPriv)
            // await discussions.post(reply as any)
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    @action toggleOpen = () => {
        this.open = !this.open
    }
}
