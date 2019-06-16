import {extendObservable, observable} from "mobx";

const defaultState = {
    activeBanner: 'test'
};

export default class Ui {
    @observable activeBanner = '123';

    constructor(UI = null) {
        extendObservable(this, UI || defaultState)
    }
}
