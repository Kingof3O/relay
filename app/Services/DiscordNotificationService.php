<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\IntegrationDeliveryLog;
use App\Models\Webhook;
use App\Models\WorkRequest;
use App\Support\UrlSecurity;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class DiscordNotificationService
{
    public const CACHE_KEY_ENABLED = 'integration.discord.enabled';

    public const CACHE_KEY_WEBHOOK_URL = 'integration.discord.webhook_url';

    public const CACHE_KEY_BOT_NAME = 'integration.discord.bot_name';

    public const CACHE_KEY_AVATAR_URL = 'integration.discord.avatar_url';

    public const CACHE_KEY_EVENTS = 'integration.discord.events';

    public static function isEnabled(): bool
    {
        if (! config('relay.integrations.discord_enabled', true)) {
            return false;
        }

        $override = Cache::get(self::CACHE_KEY_ENABLED);
        if ($override !== null) {
            return (bool) $override;
        }

        $configured = config('services.discord.enabled');
        if ($configured !== null && $configured !== '') {
            return filter_var($configured, FILTER_VALIDATE_BOOLEAN);
        }

        return false;
    }

    public static function getWebhookUrl(): ?string
    {
        $cached = Cache::get(self::CACHE_KEY_WEBHOOK_URL);
        if (! blank($cached)) {
            return (string) $cached;
        }

        $configured = config('services.discord.webhook_url');
        if (! blank($configured)) {
            return (string) $configured;
        }

        // Check if there is an active Discord webhook record in webhooks table
        $matching = Webhook::query()
            ->where('is_active', true)
            ->where('url', 'like', '%discord.com/api/webhooks%')
            ->first();

        return $matching?->url;
    }

    public static function getBotName(): string
    {
        return (string) (Cache::get(self::CACHE_KEY_BOT_NAME)
            ?: config('services.discord.username', 'Relay Studio'));
    }

    public static function getAvatarUrl(): ?string
    {
        return Cache::get(self::CACHE_KEY_AVATAR_URL)
            ?: config('services.discord.avatar_url');
    }

    /** @return array<string, bool> */
    public static function getSubscribedEvents(): array
    {
        $defaults = [
            'ticket_created' => true,
            'ticket_status' => true,
            'ticket_assigned' => true,
            'ticket_blocked' => true,
            'ticket_comment' => true,
        ];

        $cached = Cache::get(self::CACHE_KEY_EVENTS);
        if (is_array($cached)) {
            return array_merge($defaults, $cached);
        }

        return $defaults;
    }

    /**
     * Update Discord configuration.
     *
     * @param  array<string, mixed>  $settings
     */
    public static function updateSettings(array $settings): void
    {
        if (array_key_exists('enabled', $settings)) {
            Cache::forever(self::CACHE_KEY_ENABLED, (bool) $settings['enabled']);
        }

        if (array_key_exists('webhook_url', $settings)) {
            Cache::forever(self::CACHE_KEY_WEBHOOK_URL, (string) ($settings['webhook_url'] ?? ''));
        }

        if (array_key_exists('bot_name', $settings)) {
            Cache::forever(self::CACHE_KEY_BOT_NAME, (string) ($settings['bot_name'] ?? 'Relay Studio'));
        }

        if (array_key_exists('avatar_url', $settings)) {
            Cache::forever(self::CACHE_KEY_AVATAR_URL, (string) ($settings['avatar_url'] ?? ''));
        }

        if (array_key_exists('events', $settings) && is_array($settings['events'])) {
            Cache::forever(self::CACHE_KEY_EVENTS, $settings['events']);
        }
    }

    /**
     * Get settings status summary for dashboard and settings UI.
     *
     * @return array<string, mixed>
     */
    public static function getStatus(): array
    {
        $url = self::getWebhookUrl();
        $maskedUrl = ! empty($url) && strlen($url) > 30
            ? substr($url, 0, 32).'••••'.substr($url, -6)
            : $url;

        return [
            'enabled' => self::isEnabled(),
            'configured' => ! empty($url),
            'webhook_url' => $url,
            'masked_webhook_url' => $maskedUrl,
            'bot_name' => self::getBotName(),
            'avatar_url' => self::getAvatarUrl(),
            'events' => self::getSubscribedEvents(),
        ];
    }

    /**
     * Build rich Discord Embed array for a given work request notification.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public static function buildEmbed(WorkRequest $workRequest, array $payload = []): array
    {
        $workRequest->loadMissing(['area', 'assignee', 'requester']);

        $priority = $workRequest->priority instanceof \BackedEnum
            ? $workRequest->priority->value
            : (string) ($workRequest->priority ?? 'normal');

        $status = $workRequest->status instanceof \BackedEnum
            ? $workRequest->status->value
            : (string) ($workRequest->status ?? 'new');

        $event = (string) ($payload['event'] ?? 'notification');
        $message = (string) ($payload['message'] ?? "Update on #REQ-{$workRequest->id}: {$workRequest->title}");
        $ticketUrl = (string) ($payload['url'] ?? route('requests.show', $workRequest));
        $projectName = $workRequest->area?->name ?? 'Default Project';
        $assigneeName = $workRequest->assignee?->name ?? 'Unassigned';
        $requesterName = $workRequest->requester?->name ?? 'Unknown';

        // Discord embed color coding
        $color = match (true) {
            $workRequest->is_blocked || $priority === 'urgent' => 0xE11D48, // Rose/Red
            $status === 'done' => 0x10B981,                                // Emerald/Green
            $status === 'review' || $event === 'mention' => 0x8B5CF6,      // Violet/Purple
            $event === 'assignment' || $status === 'in_progress' => 0x0284C7, // Sky/Blue
            $event === 'comment' || $priority === 'high' => 0xF59E0B,     // Amber/Orange
            default => 0x71717A,                                           // Zinc
        };

        $eventLabel = match ($event) {
            'created' => '🆕 Ticket Created',
            'assignment' => '⚡ Work Assigned',
            'status_changed', 'status' => '🔄 Status Updated',
            'review' => '👀 Ready for Review',
            'done' => '✅ Ticket Completed',
            'reopened' => '↩️ Ticket Reopened',
            'blocked' => '🚧 Roadblock Flagged',
            'comment' => '💬 New Comment',
            'mention' => '🔔 Mention',
            default => '⚡ '.ucwords(str_replace('_', ' ', $event)),
        };

        $fields = [
            ['name' => 'Event', 'value' => $eventLabel, 'inline' => true],
            ['name' => 'Project', 'value' => $projectName, 'inline' => true],
            ['name' => 'Priority', 'value' => ucfirst($priority), 'inline' => true],
            ['name' => 'Status', 'value' => ucfirst(str_replace('_', ' ', $status)), 'inline' => true],
            ['name' => 'Assignee', 'value' => $assigneeName, 'inline' => true],
            ['name' => 'Requester', 'value' => $requesterName, 'inline' => true],
        ];

        if ($workRequest->is_blocked && ! empty($workRequest->blocked_reason)) {
            $fields[] = [
                'name' => 'Blocked Reason',
                'value' => (string) $workRequest->blocked_reason,
                'inline' => false,
            ];
        }

        return [
            'username' => self::getBotName(),
            'avatar_url' => self::getAvatarUrl(),
            'embeds' => [
                [
                    'title' => "#REQ-{$workRequest->id}: {$workRequest->title}",
                    'url' => $ticketUrl,
                    'description' => $message,
                    'color' => $color,
                    'fields' => $fields,
                    'footer' => [
                        'text' => 'Relay Studio Automation Subsystem',
                    ],
                    'timestamp' => now()->toIso8601String(),
                ],
            ],
        ];
    }

    /**
     * Dispatch notification to Discord webhook synchronously or via queued job.
     *
     * @param  array<string, mixed>  $payload
     */
    public static function send(WorkRequest $workRequest, array $payload = []): bool
    {
        if (! self::isEnabled()) {
            return false;
        }

        $webhookUrl = self::getWebhookUrl();
        if (empty($webhookUrl) || ! UrlSecurity::isSafeDiscordWebhookUrl($webhookUrl)) {
            return false;
        }

        $event = (string) ($payload['event'] ?? 'notification');
        $events = self::getSubscribedEvents();

        // Check event subscriptions
        $eventMap = [
            'created' => 'ticket_created',
            'assignment' => 'ticket_assigned',
            'status' => 'ticket_status',
            'status_changed' => 'ticket_status',
            'review' => 'ticket_status',
            'done' => 'ticket_status',
            'reopened' => 'ticket_status',
            'blocked' => 'ticket_blocked',
            'comment' => 'ticket_comment',
            'mention' => 'ticket_comment',
        ];

        $filterKey = $eventMap[$event] ?? null;
        if ($filterKey !== null && isset($events[$filterKey]) && ! $events[$filterKey]) {
            return false;
        }

        $discordPayload = self::buildEmbed($workRequest, $payload);

        try {
            $response = Http::timeout(6)
                ->asJson()
                ->post($webhookUrl, $discordPayload);

            $isSuccess = $response->successful();

            IntegrationDeliveryLog::query()->create([
                'workspace_id' => $workRequest->workspace_id,
                'channel' => 'discord',
                'event' => $event,
                'status' => $isSuccess ? 'success' : 'failed',
                'target' => substr($webhookUrl, 0, 32).'••••',
                'summary' => "#REQ-{$workRequest->id}: {$workRequest->title} ({$event})",
                'payload' => $discordPayload,
                'error_message' => $isSuccess ? null : "HTTP {$response->status()}: {$response->body()}",
            ]);

            return $isSuccess;
        } catch (\Throwable $e) {
            Log::warning("Discord webhook dispatch failed: {$e->getMessage()}");

            IntegrationDeliveryLog::query()->create([
                'workspace_id' => $workRequest->workspace_id,
                'channel' => 'discord',
                'event' => $event,
                'status' => 'failed',
                'target' => substr($webhookUrl, 0, 32).'••••',
                'summary' => "#REQ-{$workRequest->id}: {$workRequest->title} ({$event})",
                'payload' => $discordPayload,
                'error_message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Send a test ping message to the specified (or configured) webhook URL.
     *
     * @return array{success: bool, message: string}
     */
    public static function ping(?string $customUrl = null): array
    {
        $webhookUrl = $customUrl ?: self::getWebhookUrl();

        if (empty($webhookUrl)) {
            return [
                'success' => false,
                'message' => 'No Discord Webhook URL configured. Please provide a valid webhook URL.',
            ];
        }

        if (! UrlSecurity::isSafeDiscordWebhookUrl($webhookUrl)) {
            return [
                'success' => false,
                'message' => 'Invalid Discord Webhook URL. URL must be a valid, public Discord webhook (https://discord.com/api/webhooks/...).',
            ];
        }

        $payload = [
            'username' => self::getBotName(),
            'avatar_url' => self::getAvatarUrl(),
            'embeds' => [
                [
                    'title' => '⚡ Relay Studio · Discord Dispatch Connected',
                    'url' => url('/'),
                    'description' => 'This is a test notification from your Relay Studio instance. Real-time ticket alerts, assignments, and status updates will be delivered to this channel.',
                    'color' => 0x8B5CF6, // Violet
                    'fields' => [
                        ['name' => 'Status', 'value' => '✅ Operational', 'inline' => true],
                        ['name' => 'Environment', 'value' => config('app.env', 'production'), 'inline' => true],
                        ['name' => 'Time', 'value' => now()->toFormattedDateString().' '.now()->toTimeString(), 'inline' => true],
                    ],
                    'footer' => [
                        'text' => 'Relay Studio Automation Pipeline',
                    ],
                    'timestamp' => now()->toIso8601String(),
                ],
            ],
        ];

        $workspaceId = auth()->user()?->currentWorkspace()?->id;

        try {
            $response = Http::timeout(6)
                ->asJson()
                ->post($webhookUrl, $payload);

            if ($response->successful()) {
                IntegrationDeliveryLog::query()->create([
                    'workspace_id' => $workspaceId,
                    'channel' => 'discord',
                    'event' => 'test.ping',
                    'status' => 'success',
                    'target' => substr($webhookUrl, 0, 32).'••••',
                    'summary' => 'Discord Webhook Connection Ping Test',
                    'payload' => $payload,
                ]);

                return [
                    'success' => true,
                    'message' => 'Test notification successfully delivered to Discord channel!',
                ];
            }

            $errMsg = "HTTP {$response->status()}";
            IntegrationDeliveryLog::query()->create([
                'workspace_id' => $workspaceId,
                'channel' => 'discord',
                'event' => 'test.ping',
                'status' => 'failed',
                'target' => substr($webhookUrl, 0, 32).'••••',
                'summary' => 'Discord Webhook Connection Ping Test',
                'payload' => $payload,
                'error_message' => $errMsg,
            ]);

            return [
                'success' => false,
                'message' => "Discord returned error: {$errMsg}",
            ];
        } catch (\Throwable $e) {
            IntegrationDeliveryLog::query()->create([
                'workspace_id' => $workspaceId,
                'channel' => 'discord',
                'event' => 'test.ping',
                'status' => 'failed',
                'target' => substr($webhookUrl, 0, 32).'••••',
                'summary' => 'Discord Webhook Connection Ping Test',
                'payload' => $payload,
                'error_message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => "Connection failed: {$e->getMessage()}",
            ];
        }
    }
}
