export interface IAccountSync {
    data: {
        lastCheckedNotifications: number
        tags: string[]
        following: {
            [publicKey: string]: string
        }
        watching: {
            [encodedThreadId: string]: [number, number] //[count, diffCount]
        }
    }
    pub: string
    time: number
    _id: string
}
