export interface CreatedAt {
    $gte: number;
}

export interface Mentions {
    $in: string[];
}

export interface Query {
    createdAt?: CreatedAt;
    mentions?: Mentions;
    threadUuid?: string
    sub?: string
}

export interface Attachment {
}

export interface Payload {
    _id: string;
    chain: string;
    id: any;
    createdAt: any;
    transaction: string;
    blockApprox: number;
    uuid: string;
    parentUuid: string;
    threadUuid: string;
    title: string;
    poster: string;
    displayName: string;
    content: string;
    sub: string;
    tags: string[];
    mentions: string[];
    edit: boolean;
    pub: string;
    sig: string;
    attachment: Attachment;
    totalReplies: number;
    upvotes: number;
    downvotes: number;
}

export interface NSDBNotificationsResponse {
    query: Query;
    account?: string
    cursorId?: number;
    count?: number;
    limit?: number;
    payload?: Payload[];
}
