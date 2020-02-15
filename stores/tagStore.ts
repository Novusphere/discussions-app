import { action, computed, observable } from 'mobx'
import { RootStore } from '@stores/index'
import { persist } from 'mobx-persist'

export class TagStore {
    @persist('list')
    @observable
    subscribed = observable.array([])

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

    @computed get tagsWithoutBaseOptions() {
        return [...this.subscribed, 'all']
            .filter(tag => ['home', 'feed'].indexOf(tag) === -1)
            .map(tag => ({
                value: tag,
                label: `#${tag}`,
            }))
    }

    getGenericTag(tagName: string) {
        return {
            name: tagName,
            logo: 'https://cdn.novusphere.io/static/atmos.svg',
            url: `/tag/${tagName}`,
        }
    }

    tagModelFromObservables = tagName => {
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
