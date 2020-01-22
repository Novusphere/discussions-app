import { Post } from '@novuspherejs'
import { action, computed, observable } from 'mobx'
import { task } from 'mobx-task'
import { sleep } from '@utils'
import { CreateForm } from '@components'

export class NewReplyModel {
    @observable editing = false
    @observable open = false

    @observable replyContent = ''
    @observable editingContent = ''

    constructor(reply: Post) {
        this.editingContent = reply.content
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
    async submitReply() {
        try {
            if (!this.replyContent) {
                throw new Error('Message cannot be empty.')
            }
            await sleep(2000)
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
