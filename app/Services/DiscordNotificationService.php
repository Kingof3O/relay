<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\IntegrationDeliveryLog;
use App\Models\Setting;
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

    public const CACHE_KEY_WEBHOOK_URLS = 'integration.discord.webhook_urls';

    public const CACHE_KEY_BOT_NAME = 'integration.discord.bot_name';

    public const CACHE_KEY_AVATAR_URL = 'integration.discord.avatar_url';

    public const CACHE_KEY_EVENTS = 'integration.discord.events';

    /**
     * Parse a string or array into an array of distinct, trimmed webhook URLs.
     *
     * @param  string|array<mixed>|null  $input
     * @return array<int, string>
     */
    public static function parseUrls(string|array|null $input): array
    {
        if (blank($input)) {
            return [];
        }

        if (is_string($input)) {
            $raw = preg_split('/[\r\n,]+/', $input) ?: [];
        } elseif (is_array($input)) {
            $raw = [];
            foreach ($input as $item) {
                if (is_string($item)) {
                    foreach (preg_split('/[\r\n,]+/', $item) ?: [] as $sub) {
                        $raw[] = $sub;
                    }
                }
            }
        } else {
            $raw = [];
        }

        $urls = [];
        foreach ($raw as $candidate) {
            $trimmed = trim((string) $candidate);
            if ($trimmed !== '' && ! in_array($trimmed, $urls, true)) {
                $urls[] = $trimmed;
            }
        }

        return $urls;
    }

    /**
     * Mask a webhook token for display.
     */
    public static function maskUrl(?string $url): ?string
    {
        if (blank($url)) {
            return null;
        }

        return strlen($url) > 30
            ? substr($url, 0, 32).'••••'.substr($url, -6)
            : $url;
    }

    public static function isEnabled(): bool
    {
        if (! config('relay.integrations.discord_enabled', true)) {
            return false;
        }

        $override = Cache::get(self::CACHE_KEY_ENABLED);
        if ($override !== null) {
            return (bool) $override;
        }

        $dbOverride = Setting::get(self::CACHE_KEY_ENABLED);
        if ($dbOverride !== null) {
            Cache::forever(self::CACHE_KEY_ENABLED, (bool) $dbOverride);

            return (bool) $dbOverride;
        }

        $configured = config('services.discord.enabled');
        if ($configured !== null && $configured !== '') {
            return filter_var($configured, FILTER_VALIDATE_BOOLEAN);
        }

        return false;
    }

    /**
     * Get all configured Discord Webhook URLs.
     *
     * @return array<int, string>
     */
    public static function getWebhookUrls(): array
    {
        $urls = [];

        $cachedUrls = Cache::get(self::CACHE_KEY_WEBHOOK_URLS);
        if (! blank($cachedUrls)) {
            $urls = array_merge($urls, self::parseUrls($cachedUrls));
        }

        $cachedSingle = Cache::get(self::CACHE_KEY_WEBHOOK_URL);
        if (! blank($cachedSingle)) {
            $urls = array_merge($urls, self::parseUrls($cachedSingle));
        }

        // Database permanent settings fallback
        if (empty($urls)) {
            $dbUrls = Setting::get(self::CACHE_KEY_WEBHOOK_URLS);
            if (! blank($dbUrls)) {
                $urls = array_merge($urls, self::parseUrls($dbUrls));
            }

            $dbSingle = Setting::get(self::CACHE_KEY_WEBHOOK_URL);
            if (! blank($dbSingle)) {
                $urls = array_merge($urls, self::parseUrls($dbSingle));
            }

            if (! empty($urls)) {
                Cache::forever(self::CACHE_KEY_WEBHOOK_URLS, $urls);
                Cache::forever(self::CACHE_KEY_WEBHOOK_URL, $urls[0] ?? '');
            }
        }

        $configUrls = config('services.discord.webhook_urls');
        if (! blank($configUrls)) {
            $urls = array_merge($urls, self::parseUrls($configUrls));
        }

        $configSingle = config('services.discord.webhook_url');
        if (! blank($configSingle)) {
            $urls = array_merge($urls, self::parseUrls($configSingle));
        }

        if (empty($urls)) {
            $matching = Webhook::query()
                ->where('is_active', true)
                ->where(function ($q): void {
                    $q->where('name', 'discord')
                        ->orWhere('url', 'like', '%discord.com/api/webhooks%');
                })
                ->pluck('url')
                ->all();

            $urls = array_merge($urls, self::parseUrls($matching));

            if (! empty($urls)) {
                Cache::forever(self::CACHE_KEY_WEBHOOK_URLS, $urls);
                Cache::forever(self::CACHE_KEY_WEBHOOK_URL, $urls[0] ?? '');
            }
        }

        $unique = array_values(array_unique($urls));

        return array_values(array_filter($unique, fn (string $u): bool => UrlSecurity::isSafeDiscordWebhookUrl($u)));
    }

    public static function getWebhookUrl(): ?string
    {
        $urls = self::getWebhookUrls();

        return $urls[0] ?? null;
    }

    public static function getBotName(): string
    {
        $cached = Cache::get(self::CACHE_KEY_BOT_NAME);
        if (! blank($cached)) {
            return (string) $cached;
        }

        $db = Setting::get(self::CACHE_KEY_BOT_NAME);
        if (! blank($db)) {
            Cache::forever(self::CACHE_KEY_BOT_NAME, (string) $db);

            return (string) $db;
        }

        return (string) config('services.discord.username', 'Relay Studio');
    }

    public static function getAvatarUrl(): ?string
    {
        $cached = Cache::get(self::CACHE_KEY_AVATAR_URL);
        if (! blank($cached)) {
            return (string) $cached;
        }

        $db = Setting::get(self::CACHE_KEY_AVATAR_URL);
        if (! blank($db)) {
            Cache::forever(self::CACHE_KEY_AVATAR_URL, (string) $db);

            return (string) $db;
        }

        return config('services.discord.avatar_url');
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

        $db = Setting::get(self::CACHE_KEY_EVENTS);
        if (is_array($db)) {
            Cache::forever(self::CACHE_KEY_EVENTS, $db);

            return array_merge($defaults, $db);
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
            $enabled = (bool) $settings['enabled'];
            Cache::forever(self::CACHE_KEY_ENABLED, $enabled);
            Setting::set(self::CACHE_KEY_ENABLED, $enabled);
        }

        $urls = null;
        if (array_key_exists('webhook_urls', $settings)) {
            $urls = self::parseUrls($settings['webhook_urls']);
            Cache::forever(self::CACHE_KEY_WEBHOOK_URLS, $urls);
            Cache::forever(self::CACHE_KEY_WEBHOOK_URL, $urls[0] ?? '');
            Setting::set(self::CACHE_KEY_WEBHOOK_URLS, $urls);
            Setting::set(self::CACHE_KEY_WEBHOOK_URL, $urls[0] ?? '');
        } elseif (array_key_exists('webhook_url', $settings)) {
            $urls = self::parseUrls($settings['webhook_url']);
            Cache::forever(self::CACHE_KEY_WEBHOOK_URLS, $urls);
            Cache::forever(self::CACHE_KEY_WEBHOOK_URL, $urls[0] ?? '');
            Setting::set(self::CACHE_KEY_WEBHOOK_URLS, $urls);
            Setting::set(self::CACHE_KEY_WEBHOOK_URL, $urls[0] ?? '');
        }

        if (array_key_exists('bot_name', $settings)) {
            $botName = (string) ($settings['bot_name'] ?? 'Relay Studio');
            Cache::forever(self::CACHE_KEY_BOT_NAME, $botName);
            Setting::set(self::CACHE_KEY_BOT_NAME, $botName);
        }

        if (array_key_exists('avatar_url', $settings)) {
            $avatar = (string) ($settings['avatar_url'] ?? '');
            Cache::forever(self::CACHE_KEY_AVATAR_URL, $avatar);
            Setting::set(self::CACHE_KEY_AVATAR_URL, $avatar);
        }

        if (array_key_exists('events', $settings) && is_array($settings['events'])) {
            Cache::forever(self::CACHE_KEY_EVENTS, $settings['events']);
            Setting::set(self::CACHE_KEY_EVENTS, $settings['events']);
        }

        // Synchronize with database webhooks table for permanent multi-source redundancy
        if ($urls !== null) {
            $active = self::isEnabled();
            $events = self::getSubscribedEvents();

            Webhook::query()
                ->where('name', 'discord')
                ->whereNotIn('url', $urls)
                ->update(['is_active' => false]);

            foreach ($urls as $url) {
                Webhook::query()->updateOrCreate(
                    ['url' => $url],
                    [
                        'name' => 'discord',
                        'is_active' => $active,
                        'events' => $events,
                    ]
                );
            }
        }
    }

    /**
     * Get settings status summary for dashboard and settings UI.
     *
     * @return array<string, mixed>
     */
    public static function getStatus(): array
    {
        $urls = self::getWebhookUrls();
        $maskedUrls = array_values(array_filter(array_map([self::class, 'maskUrl'], $urls)));
        $primaryUrl = $urls[0] ?? null;

        return [
            'enabled' => self::isEnabled(),
            'configured' => ! empty($urls),
            'webhook_urls' => $urls,
            'masked_webhook_urls' => $maskedUrls,
            'webhook_url' => $primaryUrl,
            'masked_webhook_url' => self::maskUrl($primaryUrl),
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
            $event === 'assignment' || $status === 'in_progress' || $status === 'doing' => 0x0284C7, // Sky/Blue
            $status === 'ready' => 0x6366F1,                               // Indigo
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
     * Dispatch notification to all configured Discord webhooks.
     *
     * @param  array<string, mixed>  $payload
     */
    public static function send(WorkRequest $workRequest, array $payload = []): bool
    {
        if (! self::isEnabled()) {
            return false;
        }

        $webhookUrls = self::getWebhookUrls();
        if (empty($webhookUrls)) {
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
        $deliveredCount = 0;

        foreach ($webhookUrls as $webhookUrl) {
            try {
                $response = Http::timeout(6)
                    ->asJson()
                    ->post($webhookUrl, $discordPayload);

                $isSuccess = $response->successful();
                if ($isSuccess) {
                    $deliveredCount++;
                }

                IntegrationDeliveryLog::query()->create([
                    'workspace_id' => $workRequest->workspace_id,
                    'channel' => 'discord',
                    'event' => $event,
                    'status' => $isSuccess ? 'success' : 'failed',
                    'target' => self::maskUrl($webhookUrl),
                    'summary' => "#REQ-{$workRequest->id}: {$workRequest->title} ({$event})",
                    'payload' => $discordPayload,
                    'error_message' => $isSuccess ? null : "HTTP {$response->status()}: {$response->body()}",
                ]);
            } catch (\Throwable $e) {
                Log::warning("Discord webhook dispatch failed for {$webhookUrl}: {$e->getMessage()}");

                IntegrationDeliveryLog::query()->create([
                    'workspace_id' => $workRequest->workspace_id,
                    'channel' => 'discord',
                    'event' => $event,
                    'status' => 'failed',
                    'target' => self::maskUrl($webhookUrl),
                    'summary' => "#REQ-{$workRequest->id}: {$workRequest->title} ({$event})",
                    'payload' => $discordPayload,
                    'error_message' => $e->getMessage(),
                ]);
            }
        }

        return $deliveredCount > 0;
    }

    /**
     * Send a test ping message to the specified (or configured) webhook URL(s).
     *
     * @param  string|array<mixed>|null  $customUrls
     * @return array{success: bool, message: string}
     */
    public static function ping(string|array|null $customUrls = null): array
    {
        $urls = ! blank($customUrls)
            ? self::parseUrls($customUrls)
            : self::getWebhookUrls();

        if (empty($urls)) {
            return [
                'success' => false,
                'message' => 'No Discord Webhook URL configured. Please provide at least one valid webhook URL.',
            ];
        }

        foreach ($urls as $url) {
            if (! UrlSecurity::isSafeDiscordWebhookUrl($url)) {
                return [
                    'success' => false,
                    'message' => 'Invalid Discord Webhook URL. All URLs must be valid, public Discord webhooks (https://discord.com/api/webhooks/...).',
                ];
            }
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
        $successCount = 0;
        $errors = [];

        foreach ($urls as $url) {
            try {
                $response = Http::timeout(6)
                    ->asJson()
                    ->post($url, $payload);

                if ($response->successful()) {
                    $successCount++;
                    IntegrationDeliveryLog::query()->create([
                        'workspace_id' => $workspaceId,
                        'channel' => 'discord',
                        'event' => 'test.ping',
                        'status' => 'success',
                        'target' => self::maskUrl($url),
                        'summary' => 'Discord Webhook Connection Ping Test',
                        'payload' => $payload,
                    ]);
                } else {
                    $errMsg = "HTTP {$response->status()}";
                    $errors[] = $errMsg;
                    IntegrationDeliveryLog::query()->create([
                        'workspace_id' => $workspaceId,
                        'channel' => 'discord',
                        'event' => 'test.ping',
                        'status' => 'failed',
                        'target' => self::maskUrl($url),
                        'summary' => 'Discord Webhook Connection Ping Test',
                        'payload' => $payload,
                        'error_message' => $errMsg,
                    ]);
                }
            } catch (\Throwable $e) {
                $errors[] = $e->getMessage();
                IntegrationDeliveryLog::query()->create([
                    'workspace_id' => $workspaceId,
                    'channel' => 'discord',
                    'event' => 'test.ping',
                    'status' => 'failed',
                    'target' => self::maskUrl($url),
                    'summary' => 'Discord Webhook Connection Ping Test',
                    'payload' => $payload,
                    'error_message' => $e->getMessage(),
                ]);
            }
        }

        $total = count($urls);
        if ($successCount === $total) {
            return [
                'success' => true,
                'message' => $total > 1
                    ? "Test notification successfully delivered to all {$total} Discord channels!"
                    : 'Test notification successfully delivered to Discord channel!',
            ];
        }

        if ($successCount > 0) {
            return [
                'success' => true,
                'message' => "Delivered to {$successCount} of {$total} Discord channels. Some failed: ".implode(', ', array_unique($errors)),
            ];
        }

        return [
            'success' => false,
            'message' => 'Discord test delivery failed: '.implode(', ', array_unique($errors)),
        ];
    }
}
