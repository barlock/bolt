import { StringIndexed } from '../helpers';
import { MessageAttachment, KnownBlock, Block, View } from '@slack/types';
/**
 * All known event types in Slack's Events API
 *
 * This is a discriminated union. The discriminant is the `type` property.
 */
export declare type SlackEvent = AppRequestedEvent | AppHomeOpenedEvent | AppMentionEvent | AppUninstalledEvent | ChannelArchiveEvent | ChannelCreatedEvent | ChannelDeletedEvent | ChannelHistoryChangedEvent | ChannelLeftEvent | ChannelRenameEvent | ChannelSharedEvent | ChannelUnarchiveEvent | ChannelUnsharedEvent | DNDUpdatedEvent | DNDUpdatedUserEvent | EmailDomainChangedEvent | EmojiChangedEvent | FileChangeEvent | FileCommentDeletedEvent | FileCreatedEvent | FileDeletedEvent | FilePublicEvent | FileSharedEvent | FileUnsharedEvent | GridMigrationFinishedEvent | GridMigrationStartedEvent | GroupArchiveEvent | GroupCloseEvent | GroupDeletedEvent | GroupHistoryChangedEvent | GroupLeftEvent | GroupOpenEvent | GroupRenameEvent | GroupUnarchiveEvent | IMCloseEvent | IMCreatedEvent | IMHistoryChangedEvent | IMOpenEvent | LinkSharedEvent | MemberJoinedChannelEvent | MemberLeftChannelEvent | MessageEvent | PinAddedEvent | PinRemovedEvent | ReactionAddedEvent | ReactionRemovedEvent | StarAddedEvent | StarRemovedEvent | SubteamCreated | SubteamMembersChanged | SubteamSelfAddedEvent | SubteamSelfRemovedEvent | SubteamUpdatedEvent | TeamDomainChangedEvent | TeamJoinEvent | TeamRenameEvent | TokensRevokedEvent | UserChangeEvent;
/**
 * Any event in Slack's Events API
 *
 * This type is used to represent events that aren't known ahead of time. Each of the known event types also implement
 * this interface. That condition isn't enforced, since we're not interested in factoring out common properties from the
 * known event types.
 */
export interface BasicSlackEvent<Type extends string = string> extends StringIndexed {
    type: Type;
}
export interface AppRequestedEvent extends StringIndexed {
    type: 'app_requested';
    app_request: {
        id: string;
        app: {
            id: string;
            name: string;
            description: string;
            help_url: string;
            privacy_policy_url: string;
            app_homepage_url: string;
            app_directory_url: string;
            is_app_directory_approved: boolean;
            is_internal: boolean;
            additional_info: string;
        };
    };
    previous_resolution: {
        status: 'approved' | 'restricted';
        scopes: {
            name: string;
            description: string;
            is_dangerous: boolean;
            token_type: 'bot' | 'user' | 'app' | null;
        };
    } | null;
    user: {
        id: string;
        name: string;
        email: string;
    };
    team: {
        id: string;
        name: string;
        domain: string;
    };
    scopes: {
        name: string;
        description: string;
        is_dangerous: boolean;
        token_type: 'bot' | 'user' | 'app' | null;
    };
    message: string;
    date_created: number;
}
export interface AppHomeOpenedEvent extends StringIndexed {
    type: 'app_home_opened';
    user: string;
    channel: string;
    tab?: 'home' | 'messages';
    view?: View;
    event_ts: string;
}
export interface AppMentionEvent extends StringIndexed {
    type: 'app_mention';
    user: string;
    text: string;
    ts: string;
    channel: string;
    event_ts: string;
}
export interface AppUninstalledEvent extends StringIndexed {
    type: 'app_uninstalled';
}
export interface ChannelArchiveEvent extends StringIndexed {
    type: 'channel_archive';
    channel: string;
    user: string;
}
export interface ChannelCreatedEvent extends StringIndexed {
    type: 'channel_created';
    channel: {
        id: string;
        name: string;
        created: number;
        creator: string;
    };
}
export interface ChannelDeletedEvent extends StringIndexed {
    type: 'channel_deleted';
    channel: string;
}
export interface ChannelHistoryChangedEvent extends StringIndexed {
    type: 'channel_history_changed';
    latest: string;
    ts: string;
    event_ts: string;
}
export interface ChannelLeftEvent extends StringIndexed {
    type: 'channel_left';
    channel: string;
}
export interface ChannelRenameEvent extends StringIndexed {
    type: 'channel_rename';
    channel: {
        id: string;
        name: string;
        created: number;
    };
}
export interface ChannelSharedEvent extends StringIndexed {
    type: 'channel_shared';
    connected_team_id: string;
    channel: string;
    event_ts: string;
}
export interface ChannelUnarchiveEvent extends StringIndexed {
    type: 'channel_unarchive';
    channel: string;
    user: string;
}
export interface ChannelUnsharedEvent extends StringIndexed {
    type: 'channel_unshared';
    previously_connected_team_id: string;
    channel: string;
    is_ext_shared: boolean;
    event_ts: string;
}
export interface DNDUpdatedEvent extends StringIndexed {
    type: 'dnd_updated';
    user: string;
    dnd_status: {
        dnd_enabled: boolean;
        next_dnd_start_ts: number;
        next_dnd_end_ts: number;
        snooze_enabled: boolean;
        snooze_endtime: number;
        snooze_remaining: number;
    };
}
export interface DNDUpdatedUserEvent extends StringIndexed {
    type: 'dnd_updated_user';
    user: string;
    dnd_status: {
        dnd_enabled: boolean;
        next_dnd_start_ts: number;
        next_dnd_end_ts: number;
    };
}
export interface EmailDomainChangedEvent extends StringIndexed {
    type: 'email_domain_changed';
    email_domain: string;
    event_ts: string;
}
export interface EmojiChangedEvent extends StringIndexed {
    type: 'emoji_changed';
    subtype: 'add' | 'remove';
    names?: string[];
    name?: string;
    value?: string;
    event_ts: string;
}
export interface FileChangeEvent extends StringIndexed {
    type: 'file_change';
    file_id: string;
    file: {
        id: string;
    };
}
export interface FileCommentDeletedEvent extends StringIndexed {
    type: 'file_comment_deleted';
    comment: string;
    file_id: string;
    file: {
        id: string;
    };
}
export interface FileCreatedEvent extends StringIndexed {
    type: 'file_created';
    file_id: string;
    file: {
        id: string;
    };
}
export interface FileDeletedEvent extends StringIndexed {
    type: 'file_deleted';
    file_id: string;
    event_ts: string;
}
export interface FilePublicEvent extends StringIndexed {
    type: 'file_public';
    file_id: string;
    file: {
        id: string;
    };
}
export interface FileSharedEvent extends StringIndexed {
    type: 'file_shared';
    file_id: string;
    file: {
        id: string;
    };
}
export interface FileUnsharedEvent extends StringIndexed {
    type: 'file_unshared';
    file_id: string;
    file: {
        id: string;
    };
}
export interface GridMigrationFinishedEvent extends StringIndexed {
    type: 'grid_migration_finished';
    enterprise_id: string;
}
export interface GridMigrationStartedEvent extends StringIndexed {
    type: 'grid_migration_started';
    enterprise_id: string;
}
export interface GroupArchiveEvent extends StringIndexed {
    type: 'group_archive';
    channel: string;
}
export interface GroupCloseEvent extends StringIndexed {
    type: 'group_close';
    user: string;
    channel: string;
}
export interface GroupDeletedEvent extends StringIndexed {
    type: 'group_deleted';
    channel: string;
}
export interface GroupHistoryChangedEvent extends StringIndexed {
    type: 'group_history_changed';
    latest: string;
    ts: string;
    event_ts: string;
}
export interface GroupLeftEvent extends StringIndexed {
    type: 'group_left';
    channel: string;
}
export interface GroupOpenEvent extends StringIndexed {
    type: 'group_open';
    user: string;
    channel: string;
}
export interface GroupRenameEvent extends StringIndexed {
    type: 'group_rename';
    channel: {
        id: string;
        name: string;
        created: number;
    };
}
export interface GroupUnarchiveEvent extends StringIndexed {
    type: 'group_unarchive';
    channel: string;
}
export interface IMCloseEvent extends StringIndexed {
    type: 'im_close';
    user: string;
    channel: string;
}
export interface IMCreatedEvent extends StringIndexed {
    type: 'im_created';
    user: string;
    channel: {
        id: string;
    };
}
export interface IMHistoryChangedEvent extends StringIndexed {
    type: 'im_history_changed';
    latest: string;
    ts: string;
    event_ts: string;
}
export interface IMOpenEvent extends StringIndexed {
    type: 'im_open';
    user: string;
    channel: string;
}
export interface InviteRequestedEvent extends StringIndexed {
    type: 'invite_requested';
    invite_request: {
        id: string;
        email: string;
        date_created: number;
        requester_ids: string[];
        channel_ids: string[];
        invite_type: 'restricted' | 'ultra_restricted' | 'full_member';
        real_name: string;
        date_expire: number;
        request_reason: string;
        team: {
            id: string;
            name: string;
            domain: string;
        };
    };
}
export interface LinkSharedEvent extends StringIndexed {
    type: 'link_shared';
    channel: string;
    user: string;
    message_ts: string;
    thread_ts?: string;
    links: {
        domain: string;
        url: string;
    }[];
}
export interface MemberJoinedChannelEvent extends StringIndexed {
    type: 'member_joined_channel';
    user: string;
    channel: string;
    channel_type: string;
    team: string;
    inviter?: string;
}
export interface MemberLeftChannelEvent extends StringIndexed {
    type: 'member_left_channel';
    user: string;
    channel: string;
    channel_type: string;
    team: string;
}
export interface MessageEvent extends StringIndexed {
    type: 'message';
    channel: string;
    user: string;
    text?: string;
    ts: string;
    attachments?: MessageAttachment[];
    blocks?: (KnownBlock | Block)[];
    edited?: {
        user: string;
        ts: string;
    };
    is_starred?: boolean;
    pinned_to?: string[];
    reactions?: {
        name: string;
        count: number;
        users: string[];
    }[];
}
export interface BotMessageEvent extends StringIndexed {
    type: 'message';
    subtype: 'bot_message';
    ts: string;
    text: string;
    bot_id: string;
    username?: string;
    icons?: {
        [size: string]: string;
    };
    user?: string;
    attachments?: MessageAttachment[];
    blocks?: (KnownBlock | Block)[];
    edited?: {
        user: string;
        ts: string;
    };
}
export interface EKMAccessDeniedMessageEvent extends StringIndexed {
    type: 'message';
    subtype: 'ekm_access_denied';
    ts: string;
    text: string;
    user: 'UREVOKEDU';
}
export interface MeMessageEvent extends StringIndexed {
    type: 'message';
    subtype: 'me_message';
    channel: string;
    user: string;
    text: string;
    ts: string;
}
export interface MessageChangedEvent extends StringIndexed {
    type: 'message';
    subtype: 'message_changed';
    hidden: true;
    channel: string;
    ts: string;
    message: MessageEvent;
}
export interface MessageDeletedEvent extends StringIndexed {
    type: 'message';
    subtype: 'message_deleted';
    hidden: true;
    channel: string;
    ts: string;
    deleted_ts: string;
}
export interface MessageRepliedEvent extends StringIndexed {
    type: 'message';
    subtype: 'message_replied';
    hidden: true;
    channel: string;
    event_ts: string;
    ts: string;
    message: MessageEvent & {
        thread_ts: string;
        reply_count: number;
        replies: MessageEvent[];
    };
}
export interface ThreadBroadcastMessageEvent extends StringIndexed {
    type: 'message';
    message: {
        type: 'message';
        subtype: 'thread_broadcast';
        thread_ts: string;
        user: string;
        ts: string;
        root: MessageEvent & {
            thread_ts: string;
            reply_count: number;
            replies: MessageEvent[];
            unread_count?: number;
        };
    };
}
export interface PinAddedEvent extends StringIndexed {
    type: 'pin_added';
    user: string;
    channel_id: string;
    item: {};
}
export interface PinRemovedEvent extends StringIndexed {
    type: 'pin_removed';
    user: string;
    channel_id: string;
    item: {};
    has_pins: boolean;
    event_ts: string;
}
export interface ReactionAddedEvent extends StringIndexed {
    type: 'reaction_added';
    user: string;
    reaction: string;
    item_user: string;
    item: {};
    event_ts: string;
}
export interface ReactionRemovedEvent extends StringIndexed {
    type: 'reaction_removed';
    user: string;
    reaction: string;
    item_user: string;
    item: {};
    event_ts: string;
}
export interface StarAddedEvent extends StringIndexed {
    type: 'star_added';
    user: string;
    item: {};
    event_ts: string;
}
export interface StarRemovedEvent extends StringIndexed {
    type: 'star_removed';
    user: string;
    item: {};
    event_ts: string;
}
export interface SubteamCreated extends StringIndexed {
    type: 'subteam_created';
    subteam: {
        id: string;
    };
}
export interface SubteamMembersChanged extends StringIndexed {
    type: 'subteam_members_changed';
    subteam_id: string;
    team_id: string;
    date_previous_update: number;
    date_update: number;
    added_users: string[];
    added_users_count: number;
    removed_users: string[];
    removed_users_count: number;
}
export interface SubteamSelfAddedEvent extends StringIndexed {
    type: 'subteam_self_added';
    subteam_id: string;
}
export interface SubteamSelfRemovedEvent extends StringIndexed {
    type: 'subteam_self_removed';
    subteam_id: string;
}
export interface SubteamUpdatedEvent extends StringIndexed {
    type: 'subteam_updated';
    subteam: {
        id: string;
    };
}
export interface TeamDomainChangedEvent extends StringIndexed {
    type: 'team_domain_changed';
    url: string;
    domain: string;
}
export interface TeamJoinEvent extends StringIndexed {
    type: 'team_join';
    user: {};
}
export interface TeamRenameEvent extends StringIndexed {
    type: 'team_rename';
    name: string;
}
export interface TokensRevokedEvent extends StringIndexed {
    type: 'tokens_revoked';
    tokens: {
        oauth: string[];
        bot: string[];
    };
}
export interface UserChangeEvent extends StringIndexed {
    type: 'user_change';
    user: {};
}
//# sourceMappingURL=base-events.d.ts.map