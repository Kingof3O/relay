<?php

declare(strict_types=1);

namespace App\Services;

use App\Mail\WorkRequestNotificationMail;
use App\Models\Area;
use App\Models\IntegrationDeliveryLog;
use App\Models\User;
use App\Models\WorkRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

final class EmailNotificationService
{
    public const CACHE_KEY_SENDER_NAME = 'integration.email.sender_name';

    public const CACHE_KEY_ACCENT_COLOR = 'integration.email.accent_color';

    public const CACHE_KEY_FOOTER_NOTE = 'integration.email.footer_note';

    public const CACHE_KEY_EVENTS = 'integration.email.events';

    public static function getSenderName(): string
    {
        $cached = Cache::get(self::CACHE_KEY_SENDER_NAME);
        if (! blank($cached)) {
            return (string) $cached;
        }

        return 'Relay Studio';
    }

    public static function getAccentColor(): string
    {
        return (string) (Cache::get(self::CACHE_KEY_ACCENT_COLOR) ?: '#8B5CF6');
    }

    public static function getFooterNote(): string
    {
        return (string) (Cache::get(self::CACHE_KEY_FOOTER_NOTE)
            ?: 'Relay Studio · Enterprise Engineering & Dispatch Automation');
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
     * Update Email template branding settings.
     *
     * @param  array<string, mixed>  $settings
     */
    public static function updateSettings(array $settings): void
    {
        if (array_key_exists('sender_name', $settings)) {
            Cache::forever(self::CACHE_KEY_SENDER_NAME, (string) ($settings['sender_name'] ?? 'Relay Studio'));
        }

        if (array_key_exists('accent_color', $settings)) {
            Cache::forever(self::CACHE_KEY_ACCENT_COLOR, (string) ($settings['accent_color'] ?? '#8B5CF6'));
        }

        if (array_key_exists('footer_note', $settings)) {
            Cache::forever(self::CACHE_KEY_FOOTER_NOTE, (string) ($settings['footer_note'] ?? ''));
        }

        if (array_key_exists('events', $settings) && is_array($settings['events'])) {
            Cache::forever(self::CACHE_KEY_EVENTS, $settings['events']);
        }
    }

    /**
     * Get email template status and settings summary.
     *
     * @return array<string, mixed>
     */
    public static function getStatus(): array
    {
        return [
            'sender_name' => self::getSenderName(),
            'from_address' => config('mail.from.address', 'hello@example.com'),
            'mailer' => config('mail.default', 'smtp'),
            'accent_color' => self::getAccentColor(),
            'footer_note' => self::getFooterNote(),
            'events' => self::getSubscribedEvents(),
        ];
    }

    /**
     * Send a real test email to the user.
     *
     * @return array{success: bool, message: string}
     */
    public static function sendTestEmail(User $recipient, string $event = 'assignment'): array
    {
        if (blank($recipient->email)) {
            return [
                'success' => false,
                'message' => 'Your account does not have a valid email address configured.',
            ];
        }

        $sampleRequest = WorkRequest::query()->with(['area', 'requester', 'assignee'])->first()
            ?? self::getSampleRequest($recipient);

        $payload = [
            'event' => $event,
            'request_id' => $sampleRequest->id ?? 101,
            'request_title' => $sampleRequest->title ?? 'Optimize Redis caching pipeline for Kanban boards',
            'message' => "This is a test notification dispatched to {$recipient->email} to verify email template rendering.",
            'url' => route('requests.show', $sampleRequest->id ?? 1),
        ];

        try {
            Mail::to($recipient->email)->send(new WorkRequestNotificationMail($recipient, $sampleRequest, $payload));

            IntegrationDeliveryLog::query()->create([
                'channel' => 'email',
                'event' => 'test.email',
                'status' => 'success',
                'target' => $recipient->email,
                'summary' => "Test email notification ({$event}) sent to {$recipient->email}",
                'payload' => $payload,
            ]);

            return [
                'success' => true,
                'message' => "Test email successfully sent to {$recipient->email}!",
            ];
        } catch (\Throwable $e) {
            IntegrationDeliveryLog::query()->create([
                'channel' => 'email',
                'event' => 'test.email',
                'status' => 'failed',
                'target' => $recipient->email,
                'summary' => "Test email notification ({$event}) failed for {$recipient->email}",
                'payload' => $payload,
                'error_message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => "Failed to deliver email: {$e->getMessage()}",
            ];
        }
    }

    /**
     * Render the Blade email template as pure HTML string for interactive iframe preview.
     */
    public static function renderPreviewHtml(User $viewer, string $event = 'assignment'): string
    {
        $sampleRequest = WorkRequest::query()->with(['area', 'requester', 'assignee'])->first()
            ?? self::getSampleRequest($viewer);

        $payload = [
            'event' => $event,
            'request_id' => $sampleRequest->id ?? 101,
            'request_title' => $sampleRequest->title ?? 'Optimize Redis caching pipeline for Kanban boards',
            'message' => match ($event) {
                'assignment' => "{$viewer->name} assigned this work request to you.",
                'review' => "{$viewer->name} submitted this request for final engineering review.",
                'done' => "{$viewer->name} approved and closed this work request as Done.",
                'reopened' => "{$viewer->name} reopened this request due to regression in staging.",
                'blocked' => "{$viewer->name} flagged a blocker: Upstream database migration pending.",
                'comment' => "{$viewer->name} added a comment: 'Benchmarks look great, ready to deploy.'",
                default => 'There is an active dispatch update on #REQ-'.($sampleRequest->id ?? 101).'.',
            },
            'url' => url('/requests/'.($sampleRequest->id ?? 101)),
        ];

        $mailable = new WorkRequestNotificationMail($viewer, $sampleRequest, $payload);

        return $mailable->render();
    }

    /**
     * In-memory sample WorkRequest for preview when database has 0 records.
     */
    private static function getSampleRequest(User $user): WorkRequest
    {
        $req = new WorkRequest;
        $req->id = 101;
        $req->title = 'Optimize Redis caching pipeline for Kanban boards';
        $req->description = 'Improve serialization speed on high-frequency Kanban board loads and sync state with Reverb.';
        $req->status = 'in_progress';
        $req->priority = 'high';
        $req->due_date = now()->addDays(2);
        $req->is_blocked = false;

        $project = new Area;
        $project->id = 1;
        $project->name = 'Core Infrastructure';
        $project->color = '#8B5CF6';
        $req->setRelation('area', $project);

        $req->setRelation('assignee', $user);
        $req->setRelation('requester', $user);

        return $req;
    }
}
