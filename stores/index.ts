import User, { getUserStore } from '@stores/user'
import UI, { getUiStore } from '@stores/ui'
import Tag, { getTagStore } from '@stores/tag'
import Auth, { getAuthStore } from '@stores/auth'
import Posts, { getPostsStore } from '@stores/posts'
import Settings, { getSettingsStore } from '@stores/settings'

export interface IStores {
    userStore: User
    uiStore: UI
    tagStore: Tag
    authStore: Auth
    postsStore: Posts
    settingsStore: Settings
}

export {
    getAuthStore,
    getPostsStore,
    getSettingsStore,
    getTagStore,
    getUiStore,
    getUserStore,
}
