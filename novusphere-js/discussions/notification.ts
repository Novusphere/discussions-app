
    export interface Attachment {
        value: string;
        type: string;
        display: string;
        width: number;
        height: number;
        thumbnail: string;
    }

    export interface Reddit {
        author: string;
        permalink: string;
    }

    export interface AnonId {
        name: string;
        pub: string;
        sig: string;
        verified: boolean;
    }

    export interface JsonMetadata {
        type: string;
        title: string;
        sub: string;
        parent_uuid: string;
        parent_poster: string;
        edit: boolean;
        attachment: Attachment;
        reddit: Reddit;
        anon_id: AnonId;
    }

    export interface Data {
        poster: string;
        post_uuid: string;
        content: string;
        reply_to_poster: string;
        reply_to_post_uuid: string;
        certify: number;
        json_metadata: JsonMetadata;
    }

    export interface OAttachment {
        value: string;
        type: string;
        display: string;
        width: number;
        height: number;
    }

    export interface Parent {
        _post?: any;
        _content: string;
        score: number;
        parent?: any;
        depth: number;
        is_pinned: boolean;
        new_replies: number;
        children: any[];
        createdAt: number;
        transaction: string;
        id: any;
        up: number;
        total_replies: number;
        my_vote?: any;
        referendum?: any;
        tags: string[];
        tips: any[];
        replies: any[];
        data: Data;
        o_transaction: string;
        o_id: any;
        o_attachment: OAttachment;
        user_icons: string[];
    }

    export interface NotificationTip {
        from: string;
        to: string;
        amount: string;
        memo: string;
        symbol: string;
        contract: string;
    }

    export interface Attachment2 {
        value: string;
        type: string;
        display: string;
    }

    export interface AnonId2 {
        name: string;
        pub: string;
        sig: string;
    }

    export interface JsonMetadata2 {
        title: string;
        type: string;
        sub: string;
        parent_uuid: string;
        parent_poster: string;
        edit: boolean;
        attachment: Attachment2;
        anon_id: AnonId2;
        reddit?: any;
    }

    export interface Data2 {
        poster: string;
        post_uuid: string;
        content: string;
        reply_to_poster: string;
        reply_to_post_uuid: string;
        certify: number;
        json_metadata: JsonMetadata2;
    }

    export interface NotificationReply {
        _id: string;
        id: any;
        account: string;
        transaction: string;
        blockId: number;
        createdAt: number;
        name: string;
        data: Data2;
        offset: number;
        mentions: string[];
    }

    export interface Attachment3 {
        value: string;
        type: string;
        display: string;
        width: number;
        height: number;
    }

    export interface Reddit2 {
        author: string;
        permalink: string;
    }

    export interface AnonId3 {
        name: string;
        pub: string;
        sig: string;
        verified: boolean;
    }

    export interface JsonMetadata3 {
        type: string;
        title: string;
        sub: string;
        parent_uuid: string;
        parent_poster: string;
        edit: boolean;
        attachment: Attachment3;
        reddit: Reddit2;
        anon_id: AnonId3;
    }

    export interface INotificationData {
        poster: string;
        post_uuid: string;
        content: string;
        reply_to_poster: string;
        reply_to_post_uuid: string;
        certify: number;
        json_metadata: JsonMetadata3;
    }

    export interface OAttachment2 {
        value: string;
        type: string;
        display: string;
        width: number;
        height: number;
    }

    export interface INotificationPost {
        _post?: any;
        _content: string;
        score: number;
        parent: Parent;
        depth: number;
        is_pinned: boolean;
        new_replies: number;
        children: any[];
        createdAt: number;
        transaction: string;
        id: any;
        up: number;
        total_replies: number;
        my_vote?: any;
        referendum?: any;
        tags: string[];
        tips: NotificationTip[];
        replies: NotificationReply[];
        data: INotificationData;
        o_transaction: string;
        o_id: any;
        o_attachment: OAttachment2;
        user_icons: string[];
    }

    export interface INotifications {
        current_page: number;
        pages: number;
        posts: INotificationPost[];
    }
