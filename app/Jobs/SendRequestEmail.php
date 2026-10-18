<?php

namespace App\Jobs;

use App\Mail\WorkRequestNotificationMail;
use App\Models\IntegrationDeliveryLog;
use App\Models\User;
use App\Models\WorkRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

final class SendRequestEmail implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    public int $tries = 3;

    /** @param array<string, mixed> $payload */
    public function __construct(
        public readonly int $userId,
        public readonly array $payload,
    ) {}

    public function handle(): void
    {
        $user = User::query()->find($this->userId);

        if ($user === null || blank($user->email)) {
            return;
        }

        $prefs = (array) ($user->notification_preferences ?? []);
        $event = (string) ($this->payload['event'] ?? '');

        $shouldSend = match (true) {
            in_array($event, ['assigned', 'assignment']) => ($prefs['email_on_assignment'] ?? true) !== false,
            in_array($event, ['status', 'status_change', 'review', 'done', 'reopened', 'blocked']) => ($prefs['email_on_status_change'] ?? true) !== false,
            in_array($event, ['comment', 'mention']) => ($prefs['email_on_comment'] ?? true) !== false,
            default => true,
        };

        if (! $shouldSend) {
            return;
        }

        $requestId = $this->payload['request_id'] ?? null;
        if (! $requestId) {
            return;
        }

        $request = WorkRequest::query()
            ->with(['area', 'requester', 'assignee'])
            ->find($requestId);

        if ($request === null) {
            return;
        }

        try {
            Mail::to($user->email)->send(new WorkRequestNotificationMail($user, $request, $this->payload));

            IntegrationDeliveryLog::query()->create([
                'workspace_id' => $request->workspace_id,
                'channel' => 'email',
                'event' => $event ?: 'notification',
                'status' => 'success',
                'target' => $user->email,
                'summary' => "#REQ-{$request->id}: {$request->title} ({$event}) delivered to {$user->name}",
                'payload' => $this->payload,
            ]);
        } catch (\Throwable $e) {
            IntegrationDeliveryLog::query()->create([
                'workspace_id' => $request->workspace_id,
                'channel' => 'email',
                'event' => $event ?: 'notification',
                'status' => 'failed',
                'target' => $user->email,
                'summary' => "#REQ-{$request->id}: {$request->title} ({$event}) failed for {$user->name}",
                'payload' => $this->payload,
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
