import { computed, observable } from 'mobx'
import { RootStore } from '@stores/index'
import { persist } from 'mobx-persist'
import { task } from 'mobx-task'
import { nsdb } from '@novuspherejs'

export class TagStore {
    @persist('list')
    @observable
    subscribed = []

    @observable
    trendingTags: { tag: string }[] = []

    tags = observable.map<
        string,
        {
            name: string
            logo: string
            tagDescription: string
            memberCount: string
        }
    >()

    tagGroup = observable.map<string, string[]>()

    @observable private uiStore: RootStore['uiStore']

    constructor(rootStore: RootStore) {
        this.uiStore = rootStore.uiStore
    }

    @task
    fetchTrendingTags = async () => {
        const tags = await nsdb.getTrendingsTags()
        this.trendingTags = tags.payload.filter(({ tag }: { tag: string }) => tag !== 'tip')
    }

    @computed get tagsWithoutBaseOptions() {
        return [...this.subscribed, 'all']
            .filter(tag => ['home', 'feed'].indexOf(tag) === -1)
            .map(tag => ({
                value: tag,
                label: `#${tag}`,
            }))
    }

    @computed get genericTagLogo() {
        return this.tags.has('atmos')
            ? this.tags.get('atmos').logo
            : 'https://cdn.novusphere.io/static/atmos.png'
    }

    getGenericTag(tagName: string) {
        return {
            name: tagName,
            logo: this.genericTagLogo,
            url: `/tag/${tagName}`,
        }
    }

    tagModelFromObservables = (tagName: string) => {
        if (tagName === '') return null

        if (this.tags.has(tagName)) {
            return this.tags.get(tagName)
        }

        return this.getGenericTag(tagName)
    }

    setTagGroup = (groupName: string, tags: string[]) => {
        if (!this.tagGroup.has(groupName)) {
            this.tagGroup.set(groupName, tags)
        }
    }

    addSubscribed = (tagName: string) => {
        tagName = tagName.trim()
        if (this.subscribed.indexOf(tagName) === -1) {
            this.subscribed.unshift(tagName)
            this.uiStore.showMessage(`You have subbed to #${tagName}`, 'success')
        }
    }

    removeSubscribed = (tagName: string) => {
        if (this.subscribed.indexOf(tagName) !== -1) {
            this.subscribed.splice(this.subscribed.indexOf(tagName), 1)
        } else {
            this.subscribed.unshift(tagName)
        }
    }

    toggleSubscribe = (tagName: string) => {
        if (this.subscribed.indexOf(tagName) !== -1) {
            this.removeSubscribed(tagName)
        } else {
            this.addSubscribed(tagName)
        }
    }
}
