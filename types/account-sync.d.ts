import { BlockedContentSetting } from '@stores/settingsStore'

export interface IAccountSync {
    data: {
        lastCheckedNotifications: number
        tags: string[]
        blockedContentSetting: BlockedContentSetting
        following: {
            [publicKey: string]: string
        }
        watching: {
            [encodedThreadId: string]: [number, number] //[count, diffCount]
        }
        moderation: {
            blockedUsers: string[]
            blockedPosts: { [yyyymm: number]: string[] }
        },
        uidw: string
        pinnedPosts: any
    }
    pub: string
    time: number
    _id: string
}
