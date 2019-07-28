import User, { getUserStore } from '@stores/user'
import UI, { getUiStore } from '@stores/ui'
import Tag, { getTagStore } from '@stores/tag'
import Auth, { getAuthStore } from '@stores/auth'
import Posts, { getPostsStore } from '@stores/posts'
import Settings, { getSettingsStore } from '@stores/settings'
import { create } from 'mobx-persist'

export interface IStores {
    userStore: User
    uiStore: UI
    tagStore: Tag
    authStore: Auth
    postsStore: Posts
    settingsStore: Settings
}

const hydrate = create({
    jsonify: true,
})

export {
    hydrate,
    getAuthStore,
    getPostsStore,
    getSettingsStore,
    getTagStore,
    getUiStore,
    getUserStore,
}
