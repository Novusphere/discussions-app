import { observable } from 'mobx'
import { RootStore } from '@stores/index'
import { nsdb } from '@novuspherejs'
import { getHostName, getSettings, isDev } from '@utils'
import axios from 'axios'
import _ from 'lodash'

export class SettingsStore {
    @observable private userStore: RootStore['userStore']
    @observable private uiStore: RootStore['uiStore']
    @observable private tagStore: RootStore['tagStore']

    @observable settingsLoaded = false

    constructor(rootStore: RootStore) {
        this.userStore = rootStore.userStore
        this.uiStore = rootStore.uiStore
        this.tagStore = rootStore.tagStore
    }

    loadSettings = async () => {
        const settings = await getSettings(getHostName())

        if (settings) {
            if (!_.isNil(settings['footer'])) {
                this.uiStore.setFooterText(settings['footer'])
            }

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
                try {
                    await Promise.all(
                        _.map(tags, async (tag, name) => {
                            let { data: members } = await axios.get(
                                `${nsdb.api}/discussions/site/members/${name}`
                            )

                            if (!members) {
                                members = [{ count: 0 }]
                            }

                            this.tagStore.tags.set(name, {
                                name: name,
                                logo: tag.icon,
                                tagDescription: tag.desc,
                                memberCount: members[0].count,
                            })
                        })
                    )
                    this.settingsLoaded = true
                } catch (error) {
                    console.error('failed fetching', error)
                    this.settingsLoaded = true
                }
            } else {
                this.settingsLoaded = true
            }

            return settings
        }
    }
}
