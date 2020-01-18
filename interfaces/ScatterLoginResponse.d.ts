declare module Scatter {
    interface EosRpc {
        endpoint: string
    }

    interface Network {
        host: string
        port: number
        protocol: string
        chainId: string
    }

    interface Ctx {
        appName: string
        eosRpc: EosRpc
        network: Network
    }

    interface Meta {
        name: string
        shortName: string
        description: string
    }

    interface RequiredFields {}

    interface SignatureProvider {
        requiredFields: RequiredFields
    }

    interface Provider {
        id: string
        meta: Meta
        signatureProvider: SignatureProvider
    }

    interface Contracts {}

    interface CachedAbis {}

    interface Rpc {
        endpoint: string
    }

    interface AuthorityProvider {
        endpoint: string
    }

    interface AbiProvider {
        endpoint: string
    }

    interface RequiredFields2 {}

    interface SignatureProvider2 {
        requiredFields: RequiredFields2
    }

    interface AbiTypes {}

    interface TransactionTypes {}

    interface EosApi {
        contracts: Contracts
        cachedAbis: CachedAbis
        rpc: Rpc
        authorityProvider: AuthorityProvider
        abiProvider: AbiProvider
        signatureProvider: SignatureProvider2
        chainId: string
        abiTypes: AbiTypes
        transactionTypes: TransactionTypes
    }

    interface Auth {
        accountName: string
        permission: string
        publicKey: string
    }

    interface NetLimit {
        used: number
        available: number
        max: number
    }

    interface CpuLimit {
        used: number
        available: number
        max: number
    }

    interface Key {
        key: string
        weight: number
    }

    interface RequiredAuth {
        threshold: number
        keys: Key[]
        accounts: any[]
        waits: any[]
    }

    interface Permission {
        perm_name: string
        parent: string
        required_auth: RequiredAuth
    }

    interface TotalResources {
        owner: string
        net_weight: string
        cpu_weight: string
        ram_bytes: number
    }

    interface SelfDelegatedBandwidth {
        from: string
        to: string
        net_weight: string
        cpu_weight: string
    }

    interface VoterInfo {
        owner: string
        proxy: string
        producers: any[]
        staked: number
        last_vote_weight: string
        proxied_vote_weight: string
        is_proxy: number
        flags1: number
        reserved2: number
        reserved3: string
    }

    interface AccountInfo {
        account_name: string
        head_block_num: number
        head_block_time: Date
        privileged: boolean
        last_code_update: Date
        created: Date
        ram_quota: number
        net_weight: number
        cpu_weight: number
        net_limit: NetLimit
        cpu_limit: CpuLimit
        ram_usage: number
        permissions: Permission[]
        total_resources: TotalResources
        self_delegated_bandwidth: SelfDelegatedBandwidth
        refund_request?: any
        voter_info: VoterInfo
        rex_info?: any
    }

    interface State {
        connecting: boolean
        connected: boolean
        connectionError: boolean
        auth: Auth
        authenticating: boolean
        authenticated: boolean
        authenticationConfirmed: boolean
        authenticationError: boolean
        accountInfo: AccountInfo
        accountFetching: boolean
        accountFetchError: boolean
    }

    interface Auth2 {
        accountName: string
        permission: string
        publicKey: string
    }

    interface NetLimit2 {
        used: number
        available: number
        max: number
    }

    interface CpuLimit2 {
        used: number
        available: number
        max: number
    }

    interface Key2 {
        key: string
        weight: number
    }

    interface RequiredAuth2 {
        threshold: number
        keys: Key2[]
        accounts: any[]
        waits: any[]
    }

    interface Permission2 {
        perm_name: string
        parent: string
        required_auth: RequiredAuth2
    }

    interface TotalResources2 {
        owner: string
        net_weight: string
        cpu_weight: string
        ram_bytes: number
    }

    interface SelfDelegatedBandwidth2 {
        from: string
        to: string
        net_weight: string
        cpu_weight: string
    }

    interface VoterInfo2 {
        owner: string
        proxy: string
        producers: any[]
        staked: number
        last_vote_weight: string
        proxied_vote_weight: string
        is_proxy: number
        flags1: number
        reserved2: number
        reserved3: string
    }

    interface AccountInfo2 {
        account_name: string
        head_block_num: number
        head_block_time: Date
        privileged: boolean
        last_code_update: Date
        created: Date
        ram_quota: number
        net_weight: number
        cpu_weight: number
        net_limit: NetLimit2
        cpu_limit: CpuLimit2
        ram_usage: number
        permissions: Permission2[]
        total_resources: TotalResources2
        self_delegated_bandwidth: SelfDelegatedBandwidth2
        refund_request?: any
        voter_info: VoterInfo2
        rex_info?: any
    }

    interface RootObject {
        _instanceId: string
        ctx: Ctx
        provider: Provider
        eosApi: EosApi
        state: State
        auth: Auth2
        accountInfo: AccountInfo2
        connected: boolean
        authenticated: boolean
        inProgress: boolean
        active: boolean
        hasError: boolean
    }
}
