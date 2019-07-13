import { action, observable } from 'mobx'
import { task } from 'mobx-task'

export class ReplyModel {
    @observable uid = ''
    @observable content = ''
    @observable open = false

    constructor(uid: string) {
        this.uid = uid
    }

    @action setContent = (content: string) => {
        this.content = content
    }

    @task.resolved onSubmit = async () => {
        console.log(this.uid, this.content)
    }

    @action toggleOpen = () => {
        this.open = !this.open
    }
}
