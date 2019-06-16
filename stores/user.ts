import { extendObservable, observable } from 'mobx';

const defaultState = {
	error: null,
	displayName: null,
	photoURL: null,
	auth: false,
	uid: false
};

export default class User {
	@observable username = 'Test';

	/**
	 * Must have constructor to set default state from SSR
	 * @param User
	 */
	constructor(User = null) {
		extendObservable(this, User || defaultState);
	}
};
