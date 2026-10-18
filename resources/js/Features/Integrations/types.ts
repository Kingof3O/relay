export interface DiscordConfig {
    enabled: boolean;
    configured: boolean;
    webhook_url: string | null;
    masked_webhook_url: string | null;
    bot_name: string;
    avatar_url: string | null;
    events: {
        ticket_created: boolean;
        ticket_status: boolean;
        ticket_assigned: boolean;
        ticket_blocked: boolean;
        ticket_comment: boolean;
        [key: string]: boolean;
    };
}

export interface EmailConfig {
    sender_name: string;
    from_address: string;
    mailer: string;
    accent_color: string;
    footer_note: string;
    events: {
        ticket_created: boolean;
        ticket_status: boolean;
        ticket_assigned: boolean;
        ticket_blocked: boolean;
        ticket_comment: boolean;
        [key: string]: boolean;
    };
}

export interface DeliveryLogItem {
    id: number;
    channel: 'discord' | 'email';
    event: string;
    status: 'success' | 'failed' | 'queued';
    target: string | null;
    summary: string | null;
    error_message: string | null;
    created_at: string;
    created_human: string;
}

export interface IntegrationKpiData {
    total_dispatches: number;
    discord_count: number;
    email_count: number;
    failed_count: number;
    success_rate: number;
}
