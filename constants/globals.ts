/**
 * Possible modal options
 * for the uiStore to pick from
 */
export enum MODAL_OPTIONS {
    none = 'none',
    signUp = 'signUp',
    signIn = 'signIn',
    postWarningClose = 'postWarningClose',
    walletActionPasswordReentry = 'walletActionPasswordReentry',
    createNewCampaign = 'createNewCampaign',
}

export const Messages = {
    SUCCESS: {
        REPLY_SUCCESS: 'ReplyBox succesfully posted!',
    },
    ERROR: {
        POST_EMPTY: 'Post cannot be empty.',
    },
}

export enum SIGN_IN_OPTIONS {
    none = 'none',
    brainKey = 'brain key',
}
