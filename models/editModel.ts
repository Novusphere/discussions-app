import { action, computed, observable, set } from 'mobx'
import { IPost } from "@stores/postsStore";
import { generateUuid, getAttachmentValue } from "@utils";
import PostModel from "@models/postModel";
import { discussions, sleep } from '@novuspherejs'

interface IEditModelProps {
    content: string,
    title?: string // if no title, then it is not an OP
    posterName: string
    posterType: string
    postPriv: string
    cached: any
}

class EditModel {
    public static matchContentForMentions(content: string) {
        return content.match(/\[@(.*?)]\(.*?\)/gi)
    }

    public static extractMentionHashesForRegEx(matchedContentForMentions: any) {
        if (!matchedContentForMentions) return []
        const regex = new RegExp(/\(?EOS.*\)?\w/, 'gi')
        return matchedContentForMentions.map(items => {
            return items.match(regex)[0]
        })
    }

    public static matchContentForTags(content: string) {
        let match = content.match(/(\s|^)\#\w\w+\b/gim)

        if (match) {
            return match.map(s => s.trim())
        }

        return []
    }

    // old post
    @observable cached: any = null
    @observable posterName = ''
    @observable posterType: 'bk' | 'scatter' = 'bk'
    @observable content = ''
    @observable title = '' // only for OPs
    @observable postPriv = ''

    constructor(post: IEditModelProps) {
        set(this, post)
    }

    @computed get inlineMentions() {
        return EditModel.matchContentForMentions(this.content)
    }

    @computed get inlineMentionHashes() {
        if (!this.inlineMentions) return []
        return EditModel.extractMentionHashesForRegEx(this.inlineMentions)
    }

    @computed get inlineTags() {
        return EditModel.matchContentForTags(this.content)
    }

    @action.bound
    private createPostObject(isEdit = false) {
        let reply = {
            poster: null,
            displayName: null,
            title: '',
            createdAt: new Date(Date.now()),
            content: this.cached.content,
            sub: this.cached.sub,
            chain: 'eos',
            mentions: [
                ...this.inlineMentionHashes,
                this.cached.pub, // the person's pub you are replying to
            ],
            tags: [this.cached.sub],
            id: '',
            uuid: '',
            parentUuid: this.cached.uuid,
            threadUuid: this.cached.threadUuid,
            attachment: getAttachmentValue(this.cached.content),
            upvotes: 0,
            downvotes: 0,
            myVote: 0,
            edit: undefined,
        }

        if (!isEdit) {
            const generatedUuid = generateUuid()
            reply.id = generatedUuid
            reply.uuid = generatedUuid

            reply = {
                ...reply,
                upvotes: reply.displayName && reply.poster ? 1 : 0,
                myVote: reply.displayName && reply.poster ? 1 : 0,
            }
        }

        const posterName = this.posterName

        if (this.posterType === 'bk') {
            reply.poster = undefined
            reply.displayName = posterName
        }

        if (this.posterType === 'scatter') {
            reply.poster = posterName
            reply.displayName = posterName
        }

        let tags = this.inlineTags

        if (tags && tags.length) {
            tags = tags.map(tag => tag.replace('#', ''))
            reply.tags = [...reply.tags, ...tags]
        }

        return reply
    }

    @action.bound
    async submitEdits() {
        try {
            let reply = this.createPostObject(true)

            reply = {
                ...reply,
                content: this.content,
                edit: true,
                uuid: generateUuid(),
            }

            const model = new PostModel(reply as any)
            const signedReply = model.sign(this.postPriv)
            const response = await discussions.post(signedReply as any)
            await sleep(5000)
            return response
        } catch (error) {}
    }
}

export default EditModel
