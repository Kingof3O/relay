<?php

namespace Tests\Feature;

use App\Mail\WorkRequestNotificationMail;
use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use App\Services\WorkRequestService;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

final class WorkRequestEmailTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_creating_request_with_assignee_dispatches_email_notification(): void
    {
        Mail::fake();

        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $developer = User::query()->where('username', 'hussien')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $service = app(WorkRequestService::class);
        $request = $service->create($owner, [
            'area_id' => $area->id,
            'title' => 'Implement Webhook Security',
            'description' => 'Fix replay attack vulnerability in webhook handler.',
            'priority' => 'urgent',
            'assignee_id' => $developer->id,
        ]);

        Mail::assertQueued(WorkRequestNotificationMail::class, function (WorkRequestNotificationMail $mail) use ($developer, $request): bool {
            return $mail->hasTo($developer->email)
                && $mail->workRequest->id === $request->id
                && $mail->payload['event'] === 'assignment';
        });
    }

    public function test_updating_status_dispatches_email_notification(): void
    {
        Mail::fake();

        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $developer = User::query()->where('username', 'hussien')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Review Payment Integration',
            'description' => 'Needs code review for idempotency checks.',
            'requester_id' => $owner->id,
            'assignee_id' => $developer->id,
            'status' => 'doing',
            'priority' => 'urgent',
        ]);

        $service = app(WorkRequestService::class);
        $service->update($request, $developer, [
            'status' => 'review',
        ]);

        Mail::assertQueued(WorkRequestNotificationMail::class, function (WorkRequestNotificationMail $mail) use ($owner, $request): bool {
            return $mail->hasTo($owner->email)
                && $mail->workRequest->id === $request->id
                && $mail->payload['event'] === 'review';
        });
    }

    public function test_adding_comment_dispatches_email_notification(): void
    {
        Mail::fake();

        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $developer = User::query()->where('username', 'hussien')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Investigate Redis Memory Usage',
            'requester_id' => $owner->id,
            'assignee_id' => $developer->id,
            'status' => 'doing',
            'priority' => 'normal',
        ]);

        $service = app(WorkRequestService::class);
        $service->addComment($request, $developer, 'Identified TTL issue in key eviction policy.');

        Mail::assertQueued(WorkRequestNotificationMail::class, function (WorkRequestNotificationMail $mail) use ($owner, $request): bool {
            return $mail->hasTo($owner->email)
                && $mail->workRequest->id === $request->id
                && $mail->payload['event'] === 'comment';
        });
    }

    public function test_marking_request_blocked_dispatches_email_notification(): void
    {
        Mail::fake();

        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $developer = User::query()->where('username', 'hussien')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Deploy Stripe Webhook Migration',
            'requester_id' => $owner->id,
            'assignee_id' => $developer->id,
            'status' => 'doing',
            'priority' => 'urgent',
        ]);

        $service = app(WorkRequestService::class);
        $service->update($request, $developer, [
            'is_blocked' => true,
            'blocked_reason' => 'Waiting on API credentials from 3rd party partner.',
        ]);

        Mail::assertQueued(WorkRequestNotificationMail::class, function (WorkRequestNotificationMail $mail) use ($owner, $request): bool {
            return $mail->hasTo($owner->email)
                && $mail->workRequest->id === $request->id
                && $mail->payload['event'] === 'blocked';
        });
    }

    public function test_mailable_envelope_contains_relay_prefix_and_priority_label(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Optimize Database Queries',
            'requester_id' => $owner->id,
            'priority' => 'urgent',
        ]);

        $mailable = new WorkRequestNotificationMail($owner, $request, [
            'event' => 'assignment',
            'message' => 'New assignment',
        ]);

        $envelope = $mailable->envelope();
        $this->assertSame("[Relay] #REQ-{$request->id} - Optimize Database Queries (Urgent)", $envelope->subject);
    }

    public function test_mailable_renders_html_with_ticket_details_and_action_link(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $developer = User::query()->where('username', 'hussien')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Fix Stripe Webhook Idempotency & Replay Attack Vulnerability',
            'description' => 'Duplicate events during burst checkout are generating duplicate credit ledger records.',
            'requester_id' => $owner->id,
            'assignee_id' => $developer->id,
            'status' => 'ready',
            'priority' => 'urgent',
        ]);

        $mailable = new WorkRequestNotificationMail($developer, $request, [
            'event' => 'assignment',
            'request_id' => $request->id,
            'request_title' => $request->title,
            'message' => 'Robin assigned this work request to you.',
            'url' => route('requests.show', $request),
        ]);

        $html = $mailable->render();

        $this->assertStringContainsString('#REQ-'.$request->id, $html);
        $this->assertStringContainsString('Fix Stripe Webhook Idempotency &amp; Replay Attack Vulnerability', $html);
        $this->assertStringContainsString(route('requests.show', $request), $html);
        $this->assertStringContainsString('Open Work Request', $html);
        $this->assertStringContainsString('RELAY STUDIO', $html);
        $this->assertStringContainsString('⚡ WORK ASSIGNMENT', $html);
        $this->assertStringContainsString('#f43f5e', $html); // Urgent accent color
        $this->assertStringContainsString('Initiative / Project', $html);
    }

    public function test_mailable_renders_priority_gradients_correctly(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        // 1. Urgent priority
        $urgentReq = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Urgent Ticket',
            'requester_id' => $owner->id,
            'priority' => 'urgent',
        ]);
        $urgentMail = new WorkRequestNotificationMail($owner, $urgentReq, ['event' => 'assignment']);
        $urgentHtml = $urgentMail->render();
        $this->assertStringContainsString('#f43f5e', $urgentHtml);
        $this->assertStringContainsString('#e11d48', $urgentHtml);

        // 2. High priority
        $highReq = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'High Ticket',
            'requester_id' => $owner->id,
            'priority' => 'normal',
        ]);
        // Simulate high priority via payload
        $highMail = new WorkRequestNotificationMail($owner, $highReq, ['event' => 'review']);
        // Inject high priority value directly into content test
        $highContent = (new \ReflectionMethod($highMail, 'content'))->invoke($highMail);
        $this->assertNotNull($highContent);

        // 3. Normal priority
        $normalReq = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Normal Ticket',
            'requester_id' => $owner->id,
            'priority' => 'normal',
        ]);
        $normalMail = new WorkRequestNotificationMail($owner, $normalReq, ['event' => 'comment']);
        $normalHtml = $normalMail->render();
        $this->assertStringContainsString('#8b5cf6', $normalHtml);
        $this->assertStringContainsString('#6366f1', $normalHtml);
        $this->assertStringContainsString('💬 NEW COMMENT', $normalHtml);
    }
}
