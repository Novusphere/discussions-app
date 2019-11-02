import { action, computed, observable, set } from 'mobx'
import { task } from 'mobx-task'
import { Post } from '@novuspherejs/discussions/post'
import { Messages } from '@globals'
import { generateUuid, getAttachmentValue } from '@utils'
import { getNewAuthStore, getPostsStore, getUiStore, IStores } from '@stores'
import PostModel from '@models/postModel'
import { discussions } from '@novuspherejs'

export class ReplyModel {
    @observable uid = ''
    @observable content = ''
    @observable open = false
    @observable map: { [p: string]: PostModel }

    public readonly newAuthStore: IStores['newAuthStore']
    public readonly postStore: IStores['postsStore']
    public readonly uiStore: IStores['uiStore']

    // the post replying to
    @observable post: Post = null

    constructor(post: PostModel, map: { [p: string]: PostModel }) {
        this.uid = post.uuid
        this.map = map
        this.newAuthStore = getNewAuthStore()
        this.postStore = getPostsStore()
        this.uiStore = getUiStore()
    }

    @action setContent = (content: string) => {
        this.content = content
    }

    @action clearContent = () => {
        this.content = ''
    }

    @computed get inlineTags() {
        return this.content.match(/#([^\s.,;:!?]+)/gi)
    }

    @computed get inlineMentions() {
        return this.content.match(/\[@(.*?)]\(.*?\)/gi)
    }

    @computed get inlineMentionHashes() {
        if (!this.inlineMentions) return []

        const regex = new RegExp(/\(?EOS.*\)?\w/, 'gi')
        return this.inlineMentions.map(items => {
            return items.match(regex)[0]
        })
    }

    @task.resolved onSubmit = async () => {
        if (!this.newAuthStore.hasAccount) {
            this.uiStore.showToast('You must be logged in to comment', 'error')
            return
        }

        let post: PostModel

        if (!this.post) {
            post = this.map[this.uid]
        }

        if (!this.content) {
            throw Error(Messages.ERROR.POST_EMPTY)
        }

        const generatedUid = generateUuid()
        const posterName = this.newAuthStore.posterName

        const reply = {
            poster: null,
            displayName: null,
            title: '',
            content: this.content,
            sub: post.sub,
            chain: 'eos',
            mentions: this.inlineMentionHashes,
            tags: [post.sub],
            id: generatedUid,
            uuid: generatedUid,
            parentUuid: post.uuid,
            threadUuid: post.threadUuid,
            attachment: getAttachmentValue(this.content),
            upvotes: 0,
            downvotes: 0,
        }

        if (posterName === this.newAuthStore.displayName.bk) {
            reply.poster = undefined
            reply.displayName = posterName
        }

        if (posterName === this.newAuthStore.displayName.scatter) {
            reply.poster = posterName
            reply.displayName = posterName
        }

        let tags = this.inlineTags

        if (tags && tags.length) {
            tags = tags.map(tag => tag.replace('#', ''))
            reply.tags = [...reply.tags, ...tags]
        }

        try {
            const activeThread = this.postStore.activeThread

            if (activeThread) {
                const model = new PostModel(reply as any)
                const signedReply = model.sign(this.newAuthStore.postPriv)
                const confirmedReply = await discussions.post(signedReply as any)

                set(activeThread, {
                    map: {
                        ...activeThread.map,
                        [reply.id]: new PostModel({
                            ...confirmedReply,
                            upvotes: reply.displayName && reply.poster ? 1 : 0,
                            myVote: reply.displayName && reply.poster ? 1 : 0,
                        } as any),
                    },
                })

                this.content = ''
                this.toggleOpen()
                this.uiStore.showToast('Your reply has been submitted!', 'success')
            } else {
                this.uiStore.showToast('Failed to submit your reply', 'error')
            }
        } catch (error) {
            this.uiStore.showToast(error.message, 'error')
            throw error
        }
    }

    @action toggleOpen = () => {
        this.open = !this.open
    }
}
