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

    /**
     * @return array<string, mixed>
     */
    public function __serialize(): array
    {
        $data = [
            'recipient' => $this->getSerializedPropertyValue($this->recipient),
            'payload' => $this->payload,
        ];

        if ($this->workRequest->exists) {
            $data['workRequest'] = $this->getSerializedPropertyValue($this->workRequest);
        } else {
            $data['workRequest_raw'] = [
                'attributes' => $this->workRequest->getAttributes(),
                'area_attributes' => $this->workRequest->relationLoaded('area') ? $this->workRequest->area?->getAttributes() : null,
            ];
        }

        return $data;
    }

    /**
     * @param array<string, mixed> $values
     */
    public function __unserialize(array $values): void
    {
        $this->recipient = $this->getRestoredPropertyValue($values['recipient']);
        $this->payload = (array) ($values['payload'] ?? []);

        if (isset($values['workRequest'])) {
            try {
                $this->workRequest = $this->getRestoredPropertyValue($values['workRequest']);
            } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
                $this->workRequest = EmailNotificationService::getSampleRequest($this->recipient);
            }
        } elseif (isset($values['workRequest_raw']) && is_array($values['workRequest_raw'])) {
            $raw = $values['workRequest_raw'];
            $req = new WorkRequest((array) ($raw['attributes'] ?? []));
            if (isset($raw['attributes']['id'])) {
                $req->id = (int) $raw['attributes']['id'];
            }
            if (!empty($raw['area_attributes']) && is_array($raw['area_attributes'])) {
                $area = new \App\Models\Area($raw['area_attributes']);
                if (isset($raw['area_attributes']['id'])) {
                    $area->id = (int) $raw['area_attributes']['id'];
                }
                $req->setRelation('area', $area);
            }
            if ($this->recipient) {
                $req->setRelation('assignee', $this->recipient);
                $req->setRelation('requester', $this->recipient);
            }
            $this->workRequest = $req;
        } else {
            $this->workRequest = EmailNotificationService::getSampleRequest($this->recipient);
        }
    }

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
            'review' => 'REVIEW REQUESTED',
            'done' => 'WORK COMPLETED',
            'reopened' => 'REQUEST REOPENED',
            'blocked' => 'ROADBLOCK FLAGGED',
            'comment' => '💬 NEW COMMENT',
            default => strtoupper(str_replace('_', ' ', $event ?: 'NOTIFICATION')),
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
                'logoUrl' => EmailNotificationService::getLogoUrl(),
                'footerNote' => EmailNotificationService::getFooterNote(),
            ],
        );
    }
}
