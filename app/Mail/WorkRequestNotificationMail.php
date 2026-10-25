<?php

namespace App\Mail;

use App\Enums\RequestPriority;
use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use App\Services\EmailNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

final class WorkRequestNotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels {
        __serialize as traitSerialize;
        __unserialize as traitUnserialize;
    }

    /** @param array<string, mixed> $payload */
    public function __construct(
        public User $recipient,
        public ?WorkRequest $workRequest = null,
        public array $payload = [],
    ) {
        if ($recipient->email) {
            $this->to($recipient->email, $recipient->name);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function __serialize(): array
    {
        $values = $this->traitSerialize();

        if (! $this->workRequest || ! $this->workRequest->exists) {
            unset($values['workRequest']);
            if ($this->workRequest) {
                $values['workRequest_raw'] = [
                    'attributes' => $this->workRequest->getAttributes(),
                    'area_attributes' => $this->workRequest->relationLoaded('area') ? $this->workRequest->area?->getAttributes() : null,
                ];
            }
        }

        return $values;
    }

    /**
     * @param  array<string, mixed>  $values
     */
    public function __unserialize(array $values): void
    {
        $hasRaw = isset($values['workRequest_raw']);
        $raw = $values['workRequest_raw'] ?? null;
        unset($values['workRequest_raw']);

        try {
            $this->traitUnserialize($values);
        } catch (ModelNotFoundException) {
            $this->workRequest = EmailNotificationService::getSampleRequest($this->recipient);
        }

        if ($hasRaw && is_array($raw)) {
            $req = new WorkRequest((array) ($raw['attributes'] ?? []));
            if (isset($raw['attributes']['id'])) {
                $req->id = (int) $raw['attributes']['id'];
            }
            if (! empty($raw['area_attributes']) && is_array($raw['area_attributes'])) {
                $area = new Area($raw['area_attributes']);
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
        } elseif (! $this->workRequest) {
            $this->workRequest = EmailNotificationService::getSampleRequest($this->recipient);
        }

        if (empty($this->to) && $this->recipient && filled($this->recipient->email)) {
            $this->to($this->recipient->email, $this->recipient->name);
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
