import {observable} from "mobx";

export class TagModel {
    @observable name = '';
    @observable icon = '';

    constructor(
        name,
        icon,
    ) {
        this.name = name;
        this.icon = icon
    }
}
