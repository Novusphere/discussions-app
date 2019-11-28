import UserStore, { getUserStore } from '@stores/userStore'
import UI, { getUiStore } from '@stores/uiStore'
import TagStore, { getTagStore } from '@stores/tagStore'
import PostsStore, { getPostsStore } from '@stores/postsStore'
import SettingsStore, { getSettingsStore } from '@stores/settingsStore'
import AuthStore, { getNewAuthStore } from './authStore'
import NotificationsStore, { getNotificationsStore } from '@stores/notificationsStore'
import SearchStore, { getSearchStore } from '@stores/searchStore'
import SignUpStore, { getSignUpStore } from '@stores/signUpStore'
import SignInStore, { getSignInStore } from '@stores/signInStore'

export interface IStores {
    userStore: UserStore
    uiStore: UI
    tagStore: TagStore
    newAuthStore: AuthStore
    postsStore: PostsStore
    settingsStore: SettingsStore
    notificationsStore: NotificationsStore
    searchStore: SearchStore
    signUpStore: SignUpStore
    signInStore: SignInStore
}

export {
    getNewAuthStore,
    getPostsStore,
    getSettingsStore,
    getTagStore,
    getUiStore,
    getUserStore,
    getNotificationsStore,
    getSearchStore,
    getSignUpStore,
    getSignInStore,
}
