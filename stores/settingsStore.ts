import { observable } from 'mobx'
import { RootStore } from '@stores/index'
import { nsdb } from '@novuspherejs'
import { isDev } from '@utils'
import axios from 'axios'
import _ from 'lodash'


export class SettingsStore {
    @observable private userStore: RootStore['userStore']
    @observable private uiStore: RootStore['uiStore']
    @observable private tagStore: RootStore['tagStore']

    constructor(rootStore: RootStore) {
        this.userStore = rootStore.userStore
        this.uiStore = rootStore.uiStore
        this.tagStore = rootStore.tagStore
    }

    loadSettings = async () => {
        const { data: setting } = await axios.get(`${nsdb.api}/discussions/site`)
        let host = window.location.host.toLowerCase()
        if (isDev) host = 'discussions.app'

        let settings = setting[host]

        if (typeof settings === 'undefined' || !settings) {
            settings = setting['discussions.app']
        }

        if (settings) {
            const tags = settings['tags']
            const tagGroups = settings['defaultTagsGroups']
            const moderators = settings['defaultModerators']

            this.uiStore.banners = settings['bannerImages']

            if (moderators.length) {
                _.forEach(moderators, moderator => {
                    const [tag] = Object.keys(moderator)
                    const tagModerators = moderator[tag]

                    _.forEach(tagModerators, tagModerator => {
                        const [accountName, publicKey] = tagModerator.split('-')
                        this.userStore.setModerationMemberByTag(
                            `${accountName}:${publicKey}`,
                            tag,
                            true,
                            true
                        )
                    })
                })
            }

            if (tagGroups.length > 0) {
                _.forEach(tagGroups, group => {
                    const [key] = Object.keys(group)
                    this.tagStore.setTagGroup(key, group[key])
                })
            }

            if (tags) {
                await Promise.all(
                    _.map(tags, async (tag, name) => {
                        const { data: members } = await axios.get(
                            `${nsdb.api}/discussions/site/members/${name}`
                        )

                        this.tagStore.tags.set(name, {
                            name: name,
                            logo: tag.icon,
                            tagDescription: tag.desc,
                            memberCount: members.count,
                        })
                    })
                )
            }

            return settings
        }
    }
}
