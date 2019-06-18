import {action, observable} from "mobx";
import BaseModel from "./baseModel";

export class TagModel extends BaseModel {
    @observable name = '';
    @observable icon = '';
    @observable active = false;

    constructor(name, icon) {
        super();
        this.id = BaseModel.generateId()
        this.name = name;
        this.icon = icon
    }

    @action setActive = () => {
        this.active = !this.active
    }
}
