import { action, computed, observable } from 'mobx'
import { task } from 'mobx-task'
import { RootStore } from '@stores/index'
import { discussions, Post } from '@novuspherejs'

export class PostsStore {
    @observable
    posts: Post[] = []

    @observable
    postsPosition = {
        cursorId: undefined,
        items: 0,
    }

    @observable tagStore: RootStore['tagStore']

    constructor(rootStore: RootStore) {
        this.tagStore = rootStore.tagStore
    }

    @task
    @action
    async fetchPostsForTag(key = '', tagNames = this.tagStore.subscribed.toJS()) {
        try {
            if (!tagNames.length) tagNames = ['all']

            const { posts, cursorId } = await discussions.getPostsForSubs(
                tagNames,
                this.postsPosition.cursorId,
                this.postsPosition.items,
                20,
                key,
            )

            this.posts = [...this.posts, ...posts]

            this.postsPosition = {
                items: this.posts.length,
                cursorId,
            }

            return {
                posts: this.posts,
                position: this.postsPosition,
            }
        } catch (error) {
            throw error
        }
    }
}
