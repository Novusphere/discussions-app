import { computed, observable } from 'mobx'
import { RootStore } from '@stores/index'
import { discussions, Post, Thread } from '@novuspherejs'
import _ from 'lodash'
import { parseCookies } from 'nookies'

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
     * @param tagNames
     * @param pinnedPostsBuffer - a Base64 version of { }asPathURL, tagName }
     */
    fetchPostsForTag = async (key = '', tagNames = [], pinnedPostsBuffer = '') => {
        try {
            if (!tagNames.length) tagNames = ['all']

            const { posts, cursorId } = await discussions.getPostsForSubs(
                tagNames,
                this.postsPosition.cursorId,
                this.postsPosition.items,
                20,
                key
            )

            let pinnedPosts = []

            // get pinned posts to put at the front
            if (!this.postsPosition.cursorId && pinnedPostsBuffer) {
                // convert b64 back to obj
                const pinnedPostsAsObj = JSON.parse(
                    Buffer.from(pinnedPostsBuffer, 'base64').toString('ascii')
                )

                await Promise.all(
                    _.map(pinnedPostsAsObj, async (name, url: string) => {
                        if (tagNames[0] === name) {
                            const post = await discussions.getPostsByAsPathURL(url, key)
                            post.pinned = true
                            // this.posts.push(post)
                            pinnedPosts.push(post)
                        }
                    })
                )
            }

            this.posts = [...pinnedPosts, ...this.posts, ...posts]

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
    getPostsForKeys = async (key = '', keys = [...this.userStore.following.keys()]) => {
        try {
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

    getSearchResults = async (value: string, key= '') => {
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
