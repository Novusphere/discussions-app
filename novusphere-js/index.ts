export * from './discussions'
export * from './eos'

import { RedditService, DiscussionService } from './discussions/index'
import { EOS } from './eos'
import { NSDB } from './nsdb'
import { Settings } from './settings'
import DummyService from './discussions/service/dummy'

export const reddit = new RedditService()
export const discussions = new DiscussionService()
export const dummy = new DummyService()
export const nsdb = new NSDB()
export const eos = new EOS()
export const settings = new Settings()

export async function init() {
    await settings.init()
    await nsdb.init(settings.novusphereEndPoint)
    await eos.init(settings.eosNetwork)
}

export function sleep(timeMilliseconds: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, timeMilliseconds)
    })
}
