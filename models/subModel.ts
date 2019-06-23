import {action, observable} from "mobx";
import BaseModel from "./baseModel";

interface SubOptions {
    root: boolean
}

export class SubModel extends BaseModel {
    @observable name = '';
    @observable icon = '';
    @observable active = false;
    @observable root = false;

    constructor(name, icon, opts?: SubOptions) {
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
