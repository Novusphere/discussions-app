import { Post } from '@novuspherejs'
import { action, computed, observable } from 'mobx'
import { task } from 'mobx-task'
import { sleep } from '@utils'
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
            reply.uidw = activeUidWalletKey

            return reply
        } catch (error) {
            throw error
        }
    }

    @task.resolved
    @action.bound
    async saveEdits(form) {
        try {
            const { content } = form.values()
            this.editingContent = content
            this.toggleEditing()
            return content
        } catch (error) {
            throw error
        }
    }
}
