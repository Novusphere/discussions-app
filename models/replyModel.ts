import { action, computed, observable, set } from 'mobx'
import { task } from 'mobx-task'
import { getAuthStore, getPostsStore, getUiStore, IStores } from '@stores'
import PostModel from '@models/postModel'
import { CreateForm } from '@components'
import EditModel from '@models/editModel'
import { Messages } from '@globals'
import { discussions } from '@novuspherejs'
import { getAttachmentValue } from '@utils'

export class ReplyModel {
    @observable uid = ''
    @observable content = ''
    @observable open = false
    @observable map: { [p: string]: PostModel }

    public readonly postStore: IStores['postsStore']
    public readonly uiStore: IStores['uiStore']

    // the post replying to
    @observable post: PostModel = null

    @observable editing = false

    private readonly authStore: IStores['authStore'] = getAuthStore()

    constructor(post: PostModel, map: { [p: string]: PostModel }) {
        this.post = post
        this.uid = post.uuid
        this.map = map
        this.authStore = getAuthStore()
        this.postStore = getPostsStore()
        this.uiStore = getUiStore()
    }

    @action setContent = (content: string) => {
        this.content = content
    }

    @action clearContent = () => {
        this.content = ''
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
        if (!form.hasError) {
            const { content } = form.values()
            const { postPriv, posterType, posterName } = this.authStore

            const editModel = new EditModel({
                content: content,
                posterName: posterName,
                posterType: posterType,
                postPriv: postPriv,
                cached: this.post,
            })

            try {
                const reply = await editModel.submitEdits()

                this.post.content = reply.content
                this.post.pub = reply.pub
                this.post.editedAt = new Date(Date.now())
                this.post.transaction = reply.transaction
                this.post.edit = true

                this.uiStore.showToast('Your post has been edited!', 'success')
                this.toggleEditing()
            } catch (error) {
                this.post.content = editModel.cached.content
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
        if (!this.authStore.hasAccount) {
            this.uiStore.showToast('You must be logged in to comment', 'error')
            return
        }

        if (!this.content) {
            this.uiStore.showToast(Messages.ERROR.POST_EMPTY, 'error')
            return
        }

        const { postPriv, posterType, posterName } = this.authStore

        const instance = new EditModel({
            content: this.content,
            posterName: posterName,
            posterType: posterType,
            postPriv: postPriv,
            cached: {
                ...this.post,
                content: this.content,
            },
        })

        const reply = instance.createPostObject()

        try {
            if (activeThread) {
                const model = new PostModel(reply as any)
                const signedReply = model.sign(this.authStore.postPriv)
                const confirmedReply = await discussions.post(signedReply as any)

                const confirmedModel = new PostModel({
                    ...confirmedReply,
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
