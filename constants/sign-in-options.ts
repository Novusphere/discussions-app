import { faKey, faWallet } from '@fortawesome/free-solid-svg-icons'
import { SignInMethods } from '@globals'

export const SignInOptions = [
    {
        name: SignInMethods.eosWallet,
        icon: faWallet,
    },
    {
        name: SignInMethods.brianKey,
        icon: faKey,
    },
]
