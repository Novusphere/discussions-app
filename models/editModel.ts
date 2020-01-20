import { action, computed, observable, set } from 'mobx'
import { generateUuid, getAttachmentValue } from '@utils'
import PostModel from '@models/postModel'
import { discussions } from '@novuspherejs'
const matchAll = require('string.prototype.matchall')

interface IEditModelProps {
    content: string
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

    public static matchTipForTags(content: string) {
        let tokens = 'ATMOS|EOS'

        if (typeof window !== 'undefined') {
            tokens = window.localStorage.getItem('supp_tokens')
        }

        // this is a fix for removing zero-width characters from a js string
        const _content = content.replace(/[\u200B-\u200D\uFEFF]/g, '')
        const regex = new RegExp(
            `\\(https\\:\\/\\/beta\\.discussions\\.app\\/tag\\/tip\\)\\s(?<amount>[0-9\\.]+)\\s(?<symbol>${tokens})(?:\\s\\[(?<username>.*?)\\]\\((?<url>.*?)\\))?`,
            'gim'
        )

        let results = matchAll(_content, regex)
        let tips = []

        for (let result of results) {
            const { amount, symbol, username, url } = result.groups

            tips.push({
                amount,
                symbol,
                username,
                url,
            })
        }

        return tips
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

    @computed get inlineTips() {
        return EditModel.matchTipForTags(this.content)
    }

    @computed get mentions() {
        if (this.title || this.content === this.cached.content) {
            return this.inlineMentionHashes
        }

        return [
            ...this.inlineMentionHashes,
            this.cached.pub, // the person's pub you are replying to
        ]
    }

    @action.bound
    public createPostObject(isEdit = false) {
        let reply = {
            poster: null,
            displayName: null,
            title: this.title,
            createdAt: new Date(Date.now()),
            content: this.content,
            sub: this.cached.sub,
            chain: 'eos',
            mentions: this.mentions,
            tags: [this.cached.sub],
            id: '',
            uuid: '',
            parentUuid: this.cached.uuid,
            threadUuid: this.cached.threadUuid,
            uidw: this.cached.uidw,
            attachment: getAttachmentValue(this.cached.content),
            upvotes: 0,
            downvotes: 0,
            myVote: 0,
            edit: undefined,
            tips: undefined,
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

        let tips = this.inlineTips

        if (tips && tips.length) {
            reply.tips = tips
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

            return new Promise((resolve, reject) => {
                const int = setInterval(async () => {
                    const submitted = await discussions.wasEditSubmitted(
                        this.cached.transaction,
                        response.uuid
                    )

                    if (submitted) {
                        clearInterval(int)
                        return resolve(response)
                    }
                }, 2000)
            })
        } catch (error) {
            return error
        }
    }
}

export default EditModel
