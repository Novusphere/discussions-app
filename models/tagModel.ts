import {action, observable} from "mobx";
import BaseModel from "./baseModel";

interface TagOptions {
    root: boolean
}

export class TagModel extends BaseModel {
    @observable name = '';
    @observable icon = '';
    @observable active = false;
    @observable root = false;

    constructor(name, icon, opts?: TagOptions) {
        super();
        this.id = BaseModel.generateId();
        this.name = name;
        this.icon = icon;

        if (opts) {
            Object.keys(opts).forEach(opt => {
                this[opt] = opts[opt]
            })
        }
    }

    @action setActive = () => {
        this.active = !this.active
    }
}
