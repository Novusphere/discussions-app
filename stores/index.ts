import User from '@stores/user';
import UI from '@stores/ui';
import Tag from "@stores/tag";
import Auth from '@stores/auth';
import Posts from "@stores/posts";

export interface IStores {
	userStore: User
	uiStore: UI
	tagStore: Tag
	authStore: Auth
	postsStore: Posts
}

export const stores = {
	__userStore__: initialState => new User(initialState),
	__uiStore__: initialState => new UI(initialState),
	__tagStore__: initialState => new Tag(initialState),
	__authStore__: initialState => new Auth(initialState),
	__postsStore__: initialState => new Posts(initialState),
};

export default (store, initialState) => {
	const storeConstruct = stores[store];
	if (typeof window !== 'undefined') {
		if (!window[store]) {
			window[store] = storeConstruct(initialState);
		}
		return window[store];
	} else {
		return storeConstruct(initialState);
	}
};
