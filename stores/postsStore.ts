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
    @observable userStore: RootStore['userStore']

    constructor(rootStore: RootStore) {
        this.tagStore = rootStore.tagStore
        this.userStore = rootStore.userStore
    }

    @action.bound
    resetPostsAndPosition() {
        this.posts = []
        this.postsPosition = {
            cursorId: undefined,
            items: 0,
        }
    }

    /**
     * For fetching posts inside a tag, home page or all.
     * @param key
     * @param tagNames
     */
    @task
    @action.bound
    async fetchPostsForTag(key = '', tagNames = this.tagStore.subscribed.toJS()) {
        try {
            if (!tagNames.length) tagNames = ['all']

            const { posts, cursorId } = await discussions.getPostsForSubs(
                tagNames,
                this.postsPosition.cursorId,
                this.postsPosition.items,
                20,
                key
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
            return error
        }
    }

    /**
     * Fetch posts given an array of pub keys
     * @param key
     * @param keys
     */
    @task
    @action.bound
    async getPostsForKeys(key = '', keys = []) {
        try {
            const { posts, cursorId } = await discussions.getPostsForKeys(
                [...this.userStore.following.keys()],
                this.postsPosition.cursorId,
                this.postsPosition.items,
                20,
                key
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
            return error
        }
    }
}
