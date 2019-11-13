import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { action, observable } from 'mobx'
import { Post, discussions } from '@novuspherejs'
import { task } from 'mobx-task'

export default class SearchStore extends BaseStore {
    @observable searchResults: Post[] = []

    @observable searchPosition = {
        items: 0,
        cursorId: undefined,
    }

    @action.bound
    resetPositionAndResults() {
        this.searchResults = []
        this.searchPosition = {
            items: 0,
            cursorId: undefined,
        }
    }

    @task
    @action.bound
    async getSearchResults(value: string) {
        try {
            const { results, cursorId } = await discussions.getPostsForSearch(
                value,
                this.searchPosition.cursorId,
                this.searchPosition.items
            )

            this.searchResults = [...this.searchResults, ...results]

            this.searchPosition = {
                items: this.searchResults.length,
                cursorId,
            }

            return this.searchResults
        } catch (error) {
            return error
        }
    }
}

export const getSearchStore = getOrCreateStore('searchStore', SearchStore)
