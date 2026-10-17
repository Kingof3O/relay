<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Webhook;
use App\Models\WorkRequest;
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
    ) {
    }

    public function handle(): void
    {
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
                        'text' => "{$headline}\n*Project:* {$projectName} | *Priority:* `{$priority}` | *Status:* `{$status}`\n*Assignee:* {$assigneeName}" . ($isBlocked ? "\n*Blocked Reason:* {$blockedReason}" : '') . "\n<{$ticketUrl}|View Request in Relay Studio>",
                    ],
                ],
            ],
        ];

        $discordPayload = [
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

        // Gather destination URLs
        $urls = [];
        if ($this->targetUrl) {
            $urls[] = $this->targetUrl;
        } else {
            $activeWebhooks = Webhook::query()->where('is_active', true)->get();
            foreach ($activeWebhooks as $webhook) {
                $urls[] = $webhook->url;
            }
        }

        foreach ($urls as $url) {
            try {
                $isDiscord = str_contains($url, 'discord.com/api/webhooks');
                $payload = $isDiscord ? $discordPayload : $slackPayload;

                Http::timeout(5)->post($url, $payload);
            } catch (\Throwable $e) {
                Log::warning("Outgoing webhook failed to deliver to {$url}: {$e->getMessage()}");
            }
        }
    }
}
