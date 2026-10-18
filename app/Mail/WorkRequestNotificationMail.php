<?php

namespace App\Mail;

use App\Enums\RequestPriority;
use App\Models\User;
use App\Models\WorkRequest;
use App\Services\EmailNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

final class WorkRequestNotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /** @param array<string, mixed> $payload */
    public function __construct(
        public User $recipient,
        public WorkRequest $workRequest,
        public array $payload = [],
    ) {}

    public function envelope(): Envelope
    {
        $priorityValue = $this->workRequest->priority instanceof RequestPriority
            ? $this->workRequest->priority->value
            : (string) ($this->workRequest->priority ?? 'normal');

        $priorityLabel = $this->workRequest->priority instanceof RequestPriority
            ? $this->workRequest->priority->label()
            : ucfirst($priorityValue);

        $tag = Cache::has(EmailNotificationService::CACHE_KEY_SENDER_NAME)
            ? EmailNotificationService::getSenderName()
            : 'Relay';

        return new Envelope(
            subject: "[{$tag}] #REQ-{$this->workRequest->id} - {$this->workRequest->title} ({$priorityLabel})",
        );
    }

    public function content(): Content
    {
        $priorityValue = $this->workRequest->priority instanceof RequestPriority
            ? $this->workRequest->priority->value
            : (string) ($this->workRequest->priority ?? 'normal');

        $priorityLabel = $this->workRequest->priority instanceof RequestPriority
            ? $this->workRequest->priority->label()
            : ucfirst($priorityValue);

        $event = (string) ($this->payload['event'] ?? 'notification');
        $eventTag = match ($event) {
            'assignment' => '⚡ WORK ASSIGNMENT',
            'review' => '👀 REVIEW REQUESTED',
            'done' => '✅ WORK COMPLETED',
            'reopened' => '🔄 REQUEST REOPENED',
            'blocked' => '🚫 ROADBLOCK FLAGGED',
            'comment' => '💬 NEW COMMENT',
            default => '⚡ '.strtoupper(str_replace('_', ' ', $event ?: 'NOTIFICATION')),
        };

        $messageText = (string) ($this->payload['message'] ?? 'There is an update on this work request.');
        $url = (string) ($this->payload['url'] ?? route('requests.show', $this->workRequest));

        return new Content(
            view: 'emails.work-request-notification',
            with: [
                'recipient' => $this->recipient,
                'workRequest' => $this->workRequest,
                'payload' => $this->payload,
                'priority' => $priorityValue,
                'priorityLabel' => $priorityLabel,
                'event' => $event,
                'eventTag' => $eventTag,
                'messageText' => $messageText,
                'url' => $url,
                'senderName' => EmailNotificationService::getSenderName(),
                'customAccentColor' => EmailNotificationService::getAccentColor(),
                'footerNote' => EmailNotificationService::getFooterNote(),
            ],
        );
    }
}
