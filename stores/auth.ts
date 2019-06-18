import { extendObservable } from 'mobx';

const defaultState = {
};

export default class Auth {

    /**
     * Must have constructor to set default state from SSR
     * @param Auth
     */
    constructor(Auth = null) {
        extendObservable(this, Auth || defaultState);
    }
};
