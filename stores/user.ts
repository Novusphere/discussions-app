import { extendObservable, observable } from 'mobx';

const defaultState = {
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
