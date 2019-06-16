import {extendObservable, observable} from "mobx";
import {TagModel} from "../models/tagModel";

const defaultState = {
    activeTag: null
};

export default class Tag {
    @observable activeTag: TagModel | null = null;

    constructor(Tag = null) {
        extendObservable(this, Tag || defaultState)
    }
}
