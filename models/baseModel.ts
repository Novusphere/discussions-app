class BaseModel {
    id: number | undefined

    static nextId = 1

    static generateId() {
        return this.nextId++
    }
}

export default BaseModel
