import { observable } from 'mobx'
import { RootStore } from '@stores/index'
import { discussions, Post, Thread } from '@novuspherejs'
import _ from 'lodash'
import { task } from 'mobx-task';

export class PostsStore {
    @observable
    posts: Post[] = []

    @observable
    postsPosition: { cursorId: number | undefined; items: number } = {
        cursorId: undefined,
        items: 0,
    }

    @observable userStore: RootStore['userStore']

    constructor(rootStore: RootStore) {
        this.userStore = rootStore.userStore
    }

    resetPostsAndPosition = () => {
        this.posts = []
        this.postsPosition = {
            cursorId: undefined,
            items: 0,
        }
    }

    /**
     * For fetching posts inside a tag, home page or all.
     * @param key
     * @param {string[]} tagNames
     * @param {asPathURL, tagName[]} pinnedPosts
     */
    fetchPostsForTag = async (key = '', tagNames: string[], pinnedPosts: any[] = []) => {
        try {
            if (!tagNames || !tagNames.length) tagNames = ['all']

            const { posts, cursorId } = await discussions.getPostsForSubs(
                tagNames,
                this.postsPosition.cursorId,
                this.postsPosition.items,
                20,
                key
            )

            let _pinnedPosts: any[] = []

            // get pinned posts to put at the front
            if (!this.postsPosition.cursorId && pinnedPosts.length) {
                await Promise.all(
                    _.map(pinnedPosts, async (name, url: string) => {
                        if (tagNames[0] === name) {
                            const post = await discussions.getPostsByAsPathURL(url, key)
                            post.pinned = true
                            _pinnedPosts.push(post)
                        }
                    })
                )
            }

            this.posts = [..._pinnedPosts, ...this.posts, ...posts]

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
     * @param {string} key - the users post pub
     * @param {string[]} keys - the post pubs of users whose posts you want to return
     */
    @task
    getPostsForKeys = async (key = '', keys: string[] = []) => {
        try {
            if (!keys.length) {
                keys = [...this.userStore.following.keys()]
            }

            const { posts, cursorId } = await discussions.getPostsForKeys(
                keys,
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

    getThreadById = async (id: string, key = ''): Promise<Thread> => {
        try {
            return await discussions.getThread(id, key)
        } catch (error) {
            throw error
        }
    }

    getSearchResults = async (value: string, key = '') => {
        try {
            const { results: posts, cursorId } = await discussions.getPostsForSearch(
                value,
                this.postsPosition.cursorId,
                this.postsPosition.items,
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
