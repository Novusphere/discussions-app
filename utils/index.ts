const uuid = require('uuidv4')

export const isServer = typeof window === 'undefined'
export const sleep = milliseconds => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export const generateUuid = () => {
    return uuid()
}

export const getAttachmentValue = (post: any) => {
    const value = post.hash
    const type = post.urlType
    const display = post.hash
    const trust_provider = post.txidType

    return {
        value,
        display,
        trust_provider,
        type,
    }
}
