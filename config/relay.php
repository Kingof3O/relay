<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Backup & Disaster Recovery Configuration
    |--------------------------------------------------------------------------
    |
    | Control whether automated scheduled backups run, whether attachment files
    | are included, the cron schedule, retention periods, and storage destinations.
    |
    */
    'backup' => [
        // Master switch: Set to false to disable automated backups completely
        'enabled' => filter_var(env('RELAY_BACKUP_ENABLED', false), FILTER_VALIDATE_BOOLEAN),

        // Whether backups should archive attachment and media files by default
        'include_files' => filter_var(env('RELAY_BACKUP_INCLUDE_FILES', false), FILTER_VALIDATE_BOOLEAN),

        // Cron schedule for automated backups (default: 02:00 AM daily)
        'schedule' => env('RELAY_BACKUP_SCHEDULE', '0 2 * * *'),

        // Days to keep backups before auto-pruning (0 to disable pruning)
        'retention_days' => (int) env('RELAY_BACKUP_RETENTION_DAYS', 14),

        // Destination directory for backup archives
        'destination' => env('RELAY_BACKUP_DIR', storage_path('app/backups')),
    ],

    /*
    |--------------------------------------------------------------------------
    | Agile & Automated Background Schedules
    |--------------------------------------------------------------------------
    |
    | Control automated agile cycle rollover and background ticket movements.
    |
    */
    'agile' => [
        // Automatically roll over expired cycles and move uncompleted tickets
        'auto_rollover_enabled' => filter_var(env('RELAY_AUTO_ROLLOVER_ENABLED', true), FILTER_VALIDATE_BOOLEAN),

        // Time of day to run cycle rollover (default: 00:05 UTC)
        'rollover_time' => env('RELAY_AUTO_ROLLOVER_TIME', '00:05'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Integrations & Webhook Subsystems
    |--------------------------------------------------------------------------
    |
    | Enable or disable external webhooks and third-party notification services.
    |
    */
    'integrations' => [
        // Master switch for all outgoing webhooks
        'outgoing_webhooks_enabled' => filter_var(env('RELAY_OUTGOING_WEBHOOKS_ENABLED', true), FILTER_VALIDATE_BOOLEAN),

        // Discord webhook notifications
        'discord_enabled' => filter_var(env('RELAY_DISCORD_ENABLED', true), FILTER_VALIDATE_BOOLEAN),

        // Outbound Slack notifications
        'slack_enabled' => filter_var(env('RELAY_SLACK_ENABLED', true), FILTER_VALIDATE_BOOLEAN),

        // Inbound GitHub webhook processing
        'github_sync_enabled' => filter_var(env('RELAY_GITHUB_SYNC_ENABLED', true), FILTER_VALIDATE_BOOLEAN),

        // Inbound email webhook processing
        'inbound_email_enabled' => filter_var(env('RELAY_INBOUND_EMAIL_ENABLED', true), FILTER_VALIDATE_BOOLEAN),
    ],

    /*
    |--------------------------------------------------------------------------
    | Real-Time Collaboration & Presence
    |--------------------------------------------------------------------------
    |
    | Enable or disable WebSocket broadcasting (Laravel Reverb / Pusher).
    |
    */
    'realtime' => [
        'enabled' => filter_var(env('RELAY_REALTIME_ENABLED', true), FILTER_VALIDATE_BOOLEAN),
    ],

    /*
    |--------------------------------------------------------------------------
    | Audit Logging & Telemetry
    |--------------------------------------------------------------------------
    |
    | Control workspace audit logging to save database storage if desired.
    |
    */
    'audit' => [
        'enabled' => filter_var(env('RELAY_AUDIT_ENABLED', true), FILTER_VALIDATE_BOOLEAN),
        'retention_days' => (int) env('RELAY_AUDIT_RETENTION_DAYS', 90),
    ],

    /*
    |--------------------------------------------------------------------------
    | User Interface & Demo Controls
    |--------------------------------------------------------------------------
    |
    | Control UI behaviors, such as displaying demo account buttons.
    |
    */
    'ui' => [
        // Explicitly show or hide demo credential pills on the login screen
        'show_demo_credentials' => filter_var(
            env('RELAY_SHOW_DEMO_CREDENTIALS', env('APP_ENV') === 'local'),
            FILTER_VALIDATE_BOOLEAN
        ),
    ],
];
