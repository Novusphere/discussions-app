import { Post } from '@novuspherejs'
import { action, computed, observable } from 'mobx'
import { task } from 'mobx-task'
import { getIdenticon, sleep } from '@utils'
import { CreateForm } from '@components'
import EditModel from '@models/editModel'

export class NewReplyModel {
    @observable editing = false
    @observable open = false
    @observable reply: Post = null
    @observable replyContent = ''
    @observable editingContent = ''

    constructor(reply: Post) {
        this.editingContent = reply.content
        this.reply = reply
    }

    @computed get canEditPost() {
        return false
    }

    @computed get editForm() {
        return new CreateForm(
            {
                onSubmit: this.saveEdits,
            },
            [
                {
                    name: 'content',
                    label: 'Content',
                    value: this.editingContent,
                    hideLabels: true,
                    type: 'richtext',
                },
            ]
        )
    }

    @action.bound
    setReplyContent(content) {
        this.replyContent = content
    }

    @action.bound
    clearReplyContent() {
        this.replyContent = ''
    }

    @action.bound
    toggleEditing() {
        this.editing = !this.editing
    }

    @action.bound
    toggleOpen() {
        this.open = !this.open
    }

    @task.resolved
    @action.bound
    async submitReply({
        postPriv,
        activePublicKey,
        posterType,
        posterName,
        activeUidWalletKey,
        supportedTokensForUnifiedWallet,
    }) {
        try {
            if (!this.replyContent) {
                throw new Error('Message cannot be empty.')
            }

            const instance = new EditModel({
                content: this.replyContent,
                posterName: posterName,
                posterType: posterType,
                postPriv: postPriv,
                cached: {
                    ...this.reply,
                    content: this.replyContent,
                },
            })

            const reply = instance.createPostObject(false, postPriv)
            reply.imageData = getIdenticon(activePublicKey)
            reply.uidw = activeUidWalletKey

            return reply
        } catch (error) {
            throw error
        }
    }

    @task.resolved
    @action.bound
    async saveEdits({
        form,
        postPriv,
        activePublicKey,
        posterType,
        posterName,
        activeUidWalletKey,
        supportedTokensForUnifiedWallet,
    }) {
        try {
            const { content } = form.values()
            this.editingContent = content

            const instance = new EditModel({
                content: this.editingContent,
                posterName: posterName,
                posterType: posterType,
                postPriv: postPriv,
                cached: {
                    ...this.reply,
                    content: this.editingContent,
                },
            })

            const reply = instance.createPostObject(true)
            reply.content = this.editingContent
            reply.edit = true
            return reply
        } catch (error) {
            throw error
        }
    }
}
