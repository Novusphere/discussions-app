import { observable } from 'mobx'
import { RootStore } from '@stores/index'
import { discussions, nsdb, Post, Thread } from '@novuspherejs'
import { task } from 'mobx-task'
import { mapModsKeysToList } from '@utils'
import _ from 'lodash'

interface FetchPostsForTagParams {
    key: string
    tagNames: string[]
    sort?: string
}

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

    @task
    fetchUserByString = async (name: string) => {
        return await nsdb.searchForUserByName(name)
    }

    fetchPinnedPostsByModAndTag = async ({ mods, tag, key }) => {
        try {
            return await nsdb.getPinnedPostByModAndTag({
                mods,
                tag,
                key,
            })
        } catch (error) {
            throw error
        }
    }

    /**
     * For fetching posts inside a tag, home page or all.
     * @param key
     * @param tagNames
     * @param postPub
     * @param sort
     */
    fetchPostsForTag = async ({ key = '', tagNames, sort = 'popular' }: FetchPostsForTagParams) => {
        if (sort === '') {
            sort = 'popular'
        }

        try {
            if (!tagNames || !tagNames.length) tagNames = ['all']

            const mods = mapModsKeysToList(Array.from(this.userStore.delegated.keys()))

            const { posts, cursorId } = await discussions.getPostsForSubs({
                subs: tagNames,
                cursorId: this.postsPosition.cursorId,
                count: this.postsPosition.items,
                limit: 20,
                key,
                sort,
                mods,
            })

            const pinnedPosts = await this.fetchPinnedPostsByModAndTag({
                mods,
                tag: tagNames[0],
                key,
            })

            this.posts = _.uniqBy([...pinnedPosts, ...this.posts, ...posts], 'uuid')

            this.postsPosition = {
                items: this.posts.length,
                cursorId,
            }

            return {
                posts: this.posts,
                position: this.postsPosition,
            }
        } catch (error) {
            console.error(error)
            return error
        }
    }

    /**
     * Fetch posts given an array of pub keys
     * @param {string} key - the users post pub
     * @param {string[]} keys - the post pubs of users whose posts you want to return
     * @param sort
     */
    getPostsForKeys = async (key = '', keys: string[] = [], sort = 'popular') => {
        try {
            if (!sort) {
                sort = 'popular'
            }

            if (!keys.length) {
                keys = [...this.userStore.following.keys()]
            }

            const { posts, cursorId } = await discussions.getPostsForKeys(
                keys,
                this.postsPosition.cursorId,
                this.postsPosition.items,
                20,
                key,
                sort
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
            return await discussions.getThread(id, key, undefined)
        } catch (error) {
            throw error
        }
    }

    refreshThread = async (id: string, key = '', time): Promise<Thread> => {
        try {
            return await discussions.getThread(id, key, undefined, time)
        } catch (error) {
            throw error
        }
    }

    getSearchResults = async (value: string, key = '', sort) => {
        try {
            const { results: posts, cursorId } = await discussions.getPostsForSearch(
                value,
                this.postsPosition.cursorId,
                this.postsPosition.items,
                key,
                sort
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
