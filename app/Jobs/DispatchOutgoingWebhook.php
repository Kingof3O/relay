<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Webhook;
use App\Models\WorkRequest;
use App\Services\DiscordNotificationService;
use App\Support\UrlSecurity;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DispatchOutgoingWebhook implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public readonly int $requestId,
        public readonly string $event = 'ticket.alert',
        public readonly ?string $targetUrl = null
    ) {}

    public function handle(): void
    {
        if (! config('relay.integrations.outgoing_webhooks_enabled', true)) {
            return;
        }

        $workRequest = WorkRequest::query()
            ->with(['area', 'assignee', 'requester'])
            ->find($this->requestId);

        if (! $workRequest) {
            return;
        }

        $priority = $workRequest->priority instanceof \BackedEnum
            ? $workRequest->priority->value
            : (string) $workRequest->priority;

        $status = $workRequest->status instanceof \BackedEnum
            ? $workRequest->status->value
            : (string) $workRequest->status;

        $isUrgent = $priority === 'urgent';
        $isBlocked = (bool) $workRequest->is_blocked;

        // Only dispatch if urgent or blocked, or explicit event
        if (! $isUrgent && ! $isBlocked && $this->event === 'ticket.alert') {
            return;
        }

        $title = $workRequest->title;
        $projectName = $workRequest->area?->name ?? 'Default Project';
        $assigneeName = $workRequest->assignee?->name ?? 'Unassigned';
        $blockedReason = $workRequest->blocked_reason ?? 'None provided';
        $ticketUrl = route('requests.show', $workRequest);

        $headline = $isBlocked
            ? "🚧 [BLOCKED] #REQ-{$workRequest->id}: {$title}"
            : "🚨 [URGENT] #REQ-{$workRequest->id}: {$title}";

        $slackPayload = [
            'text' => $headline,
            'blocks' => [
                [
                    'type' => 'section',
                    'text' => [
                        'type' => 'mrkdwn',
                        'text' => "{$headline}\n*Project:* {$projectName} | *Priority:* `{$priority}` | *Status:* `{$status}`\n*Assignee:* {$assigneeName}".($isBlocked ? "\n*Blocked Reason:* {$blockedReason}" : '')."\n<{$ticketUrl}|View Request in Relay Studio>",
                    ],
                ],
            ],
        ];

        $discordPayload = [
            'username' => DiscordNotificationService::getBotName(),
            'avatar_url' => DiscordNotificationService::getAvatarUrl(),
            'content' => $headline,
            'embeds' => [
                [
                    'title' => "#REQ-{$workRequest->id}: {$title}",
                    'url' => $ticketUrl,
                    'color' => $isBlocked ? 0xE11D48 : 0xF59E0B,
                    'fields' => [
                        ['name' => 'Project', 'value' => $projectName, 'inline' => true],
                        ['name' => 'Priority', 'value' => $priority, 'inline' => true],
                        ['name' => 'Status', 'value' => $status, 'inline' => true],
                        ['name' => 'Assignee', 'value' => $assigneeName, 'inline' => true],
                        ['name' => 'Blocked', 'value' => $isBlocked ? "Yes: {$blockedReason}" : 'No', 'inline' => false],
                    ],
                    'footer' => [
                        'text' => 'Relay Studio Outgoing Webhook Subsystem',
                    ],
                    'timestamp' => now()->toIso8601String(),
                ],
            ],
        ];

        // Gather destination URLs and secrets scoped to the request workspace
        $destinations = [];
        if ($this->targetUrl) {
            $matchingWebhook = Webhook::query()
                ->where('url', $this->targetUrl)
                ->where(function ($q) use ($workRequest) {
                    if ($workRequest->workspace_id) {
                        $q->where('workspace_id', $workRequest->workspace_id)
                            ->orWhereNull('workspace_id');
                    }
                })
                ->first();
            $destinations[] = [
                'url' => $this->targetUrl,
                'secret' => $matchingWebhook?->secret,
            ];
        } else {
            $activeWebhooks = Webhook::query()
                ->where('is_active', true)
                ->where(function ($q) use ($workRequest) {
                    if ($workRequest->workspace_id) {
                        $q->where('workspace_id', $workRequest->workspace_id)
                            ->orWhereNull('workspace_id');
                    }
                })
                ->get();

            foreach ($activeWebhooks as $webhook) {
                $destinations[] = [
                    'url' => $webhook->url,
                    'secret' => $webhook->secret,
                ];
            }
        }

        foreach ($destinations as $destination) {
            $url = $destination['url'];
            $secret = $destination['secret'];

            if (! UrlSecurity::isSafeOutgoingUrl($url)) {
                Log::warning("Blocked unsafe outgoing webhook URL: {$url}");

                continue;
            }

            try {
                $isDiscord = str_contains($url, 'discord.com/api/webhooks');
                $payload = $isDiscord ? $discordPayload : $slackPayload;

                $client = Http::timeout(5);

                if (! empty($secret)) {
                    $signature = hash_hmac('sha256', (string) json_encode($payload), (string) $secret);
                    $client = $client->withHeaders([
                        'X-Relay-Signature' => "sha256={$signature}",
                    ]);
                }

                $client->post($url, $payload);
            } catch (\Throwable $e) {
                Log::warning("Outgoing webhook failed to deliver to {$url}: {$e->getMessage()}");
            }
        }
    }
}
