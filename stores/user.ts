import { observable } from 'mobx';
import {BaseStore, getOrCreateStore} from 'next-mobx-wrapper';

export default class User extends BaseStore {
	@observable username = 'Test';
};

export const getUserStore = getOrCreateStore('userStore', User)
