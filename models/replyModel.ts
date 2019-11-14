import { action, computed, observable, set } from 'mobx'
import { task } from 'mobx-task'
import { Messages } from '@globals'
import { generateUuid, getAttachmentValue, sleep } from '@utils'
import { getNewAuthStore, getPostsStore, getUiStore, IStores } from '@stores'
import PostModel from '@models/postModel'
import { discussions } from '@novuspherejs'
import CreateForm from '../components/create-form/create-form'

export class ReplyModel {
    @observable uid = ''
    @observable content = ''
    @observable open = false
    @observable map: { [p: string]: PostModel }

    public readonly newAuthStore: IStores['newAuthStore']
    public readonly postStore: IStores['postsStore']
    public readonly uiStore: IStores['uiStore']

    // the post replying to
    @observable post: PostModel = null

    @observable editing = false

    private readonly authStore: IStores['newAuthStore'] = getNewAuthStore()

    constructor(post: PostModel, map: { [p: string]: PostModel }) {
        this.post = post
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

    @action.bound
    toggleEditing(overwriteValue?: boolean) {
        if (overwriteValue) {
            this.editing = overwriteValue
            return
        }

        this.editing = !this.editing

        if (this.editing) {
            this.content = this.post.content
        }
    }

    @computed get canEditPost() {
        return this.post.pub === this.authStore.activePublicKey
    }

    @task.resolved
    @action.bound
    async saveEdits(form) {
        const cached = this

        if (!form.hasError) {
            const { content } = form.values()

            try {
                let signedEdit = await this.post.sign(this.authStore.postPriv)

                await discussions.post({
                    ...signedEdit,
                    content: content,
                    parentUuid: this.post.uuid,
                    edit: true,
                    poster: undefined,
                } as any)

                this.post.content = content
                this.post.edit = true

                this.uiStore.showToast('Your post has been edited!', 'success')
                this.toggleEditing()
            } catch (error) {
                this.post.content = cached.content
                this.uiStore.showToast('There was an error editing your post', 'error')
            }
        }
    }

    get editForm() {
        return new CreateForm({}, [
            {
                name: 'content',
                label: 'Content',
                value: this.content,
                hideLabels: true,
                type: 'richtext',
            },
            {
                name: 'buttons',
                type: 'button',
                hideLabels: true,
                extra: {
                    options: [
                        {
                            value: 'Cancel',
                            className: 'white bg-red',
                            title: 'Cancel changes to your post',
                            onClick: () => {
                                this.editing = false
                            },
                        },
                        {
                            value: 'Save',
                            title: 'Save changes to your post',
                            onClick: this.saveEdits,
                        },
                    ],
                },
            },
        ])
    }

    @task.resolved
    @action.bound
    async onSubmit(activeThread: any) {
        if (!this.newAuthStore.hasAccount) {
            this.uiStore.showToast('You must be logged in to comment', 'error')
            return
        }

        if (!this.content) {
            this.uiStore.showToast(Messages.ERROR.POST_EMPTY, 'error')
            return
        }

        const generatedUid = generateUuid()
        const posterName = this.newAuthStore.posterName

        const reply = {
            poster: null,
            displayName: null,
            title: '',
            content: this.content,
            sub: this.post.sub,
            chain: 'eos',
            mentions: this.inlineMentionHashes,
            tags: [this.post.sub],
            id: generatedUid,
            uuid: generatedUid,
            parentUuid: this.post.uuid,
            threadUuid: this.post.threadUuid,
            attachment: getAttachmentValue(this.content),
            upvotes: 0,
            downvotes: 0,
            myVote: 0,
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
            if (activeThread) {
                const model = new PostModel(reply as any)
                const signedReply = model.sign(this.newAuthStore.postPriv)
                const confirmedReply = await discussions.post(signedReply as any)

                const confirmedModel = new PostModel({
                    ...confirmedReply,
                    upvotes: reply.displayName && reply.poster ? 1 : 0,
                    myVote: reply.displayName && reply.poster ? 1 : 0
                })

                set(activeThread, {
                    map: {
                        ...activeThread.map,
                        [reply.id]: confirmedModel,
                    },
                })

                if (confirmedReply.parentUuid === this.post.threadUuid) {
                    set(activeThread, {
                        openingPostReplies: [...activeThread.openingPostReplies, confirmedModel],
                    })
                } else {
                    this.toggleOpen()
                }

                this.clearContent()
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
