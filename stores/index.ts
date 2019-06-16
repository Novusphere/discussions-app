import User from './user';
import UI from './ui';

const stores = {
	__userStore__: initialState => new User(initialState),
	__uiStore__: initialState => new UI(initialState),
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
