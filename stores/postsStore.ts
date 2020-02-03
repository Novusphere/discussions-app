import { computed, observable } from 'mobx'
import { RootStore } from '@stores/index'
import { discussions, Post } from '@novuspherejs'
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

    // @computed get pinnedPosts() {
    //     let posts = {}
    //
    //     const cookies = parseCookies()
    //
    //     console.log(cookies)
    //
    //     // if (this.userStore.hasOwnProperty('pinnedPosts')) {
    //     //     _.merge(posts, this.userStore['pinnedPosts'])
    //     // }
    //     //
    //     // if (this.userStore.hasOwnProperty('pinnedByDelegation')) {
    //     //     _.merge(posts, this.userStore['pinnedByDelegation'])
    //     // }
    //
    //     return posts
    // }

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
            if (
                !this.postsPosition.cursorId &&
                pinnedPostsBuffer
            ) {
                // convert b64 back to obj
                const pinnedPostsAsObj = JSON.parse(Buffer.from(pinnedPostsBuffer, 'base64').toString('ascii'))

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
    getPostsForKeys = async (key = '', keys = []) => {
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
