<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class InboundEmailWebhookTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private WorkRequest $ticket;

    private const WEBHOOK_SECRET = 'secure-test-webhook-secret-xyz';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        config(['services.inbound_email.webhook_secret' => self::WEBHOOK_SECRET]);

        $this->user = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $this->ticket = WorkRequest::query()->create([
            'title' => 'Sample Inbound Ticket',
            'area_id' => $area->id,
            'requester_id' => $this->user->id,
            'status' => 'new',
            'priority' => 'normal',
        ]);
    }

    public function test_unauthenticated_request_is_rejected_with_401(): void
    {
        // 1. Missing secret
        $response = $this->postJson(route('api.webhooks.inbound-email'), [
            'From' => 'Robin (Owner) <robin@relay.studio>',
            'To' => "reply+req-{$this->ticket->id}@inbound.relay.studio",
            'Subject' => 'Re: Update on task',
            'StrippedTextReply' => 'Unauthorized attempt.',
        ]);

        $response->assertStatus(401);

        // 2. Invalid secret
        $response = $this->withHeaders(['X-Inbound-Secret' => 'invalid-secret'])
            ->postJson(route('api.webhooks.inbound-email'), [
                'From' => 'Robin (Owner) <robin@relay.studio>',
                'To' => "reply+req-{$this->ticket->id}@inbound.relay.studio",
                'Subject' => 'Re: Update on task',
                'StrippedTextReply' => 'Unauthorized attempt.',
            ]);

        $response->assertStatus(401);

        // 3. Unconfigured secret fails closed in production
        config(['services.inbound_email.webhook_secret' => null]);
        $this->app->detectEnvironment(fn () => 'production');
        $response = $this->withHeaders(['X-Inbound-Secret' => self::WEBHOOK_SECRET])
            ->postJson(route('api.webhooks.inbound-email'), [
                'From' => 'Robin (Owner) <robin@relay.studio>',
                'To' => "reply+req-{$this->ticket->id}@inbound.relay.studio",
                'Subject' => 'Re: Update on task',
                'StrippedTextReply' => 'Unauthorized attempt.',
            ]);

        $response->assertStatus(401);
    }

    public function test_postmark_inbound_email_with_recipient_reply_to_ticket(): void
    {
        $response = $this->withHeaders(['X-Inbound-Secret' => self::WEBHOOK_SECRET])
            ->postJson(route('api.webhooks.inbound-email'), [
                'From' => 'Robin (Owner) <robin@relay.studio>',
                'To' => "reply+req-{$this->ticket->id}@inbound.relay.studio",
                'Subject' => 'Re: Update on task',
                'StrippedTextReply' => 'This is an inbound reply via Postmark.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('ticket_id', $this->ticket->id);

        $this->assertDatabaseHas('request_activities', [
            'request_id' => $this->ticket->id,
            'user_id' => $this->user->id,
            'type' => 'comment',
            'body' => 'This is an inbound reply via Postmark.',
        ]);
    }

    public function test_mailgun_inbound_email_with_stripped_text(): void
    {
        $response = $this->withHeaders(['X-Inbound-Secret' => self::WEBHOOK_SECRET])
            ->postJson(route('api.webhooks.inbound-email'), [
                'sender' => 'robin@relay.studio',
                'recipient' => "req-{$this->ticket->id}@mg.relay.studio",
                'subject' => 'Ticket follow up',
                'stripped-text' => 'Here is my update from Mailgun.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('ticket_id', $this->ticket->id);

        $this->assertDatabaseHas('request_activities', [
            'request_id' => $this->ticket->id,
            'user_id' => $this->user->id,
            'type' => 'comment',
            'body' => 'Here is my update from Mailgun.',
        ]);
    }

    public function test_email_with_ticket_id_in_subject(): void
    {
        $response = $this->withHeaders(['X-Inbound-Secret' => self::WEBHOOK_SECRET])
            ->postJson(route('api.webhooks.inbound-email'), [
                'from' => 'robin@relay.studio',
                'to' => 'support@relay.studio',
                'subject' => "[Relay] #REQ-{$this->ticket->id} Need further clarification",
                'body' => 'Replying to subject reference with question.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('ticket_id', $this->ticket->id);

        $this->assertDatabaseHas('request_activities', [
            'request_id' => $this->ticket->id,
            'user_id' => $this->user->id,
            'type' => 'comment',
            'body' => 'Replying to subject reference with question.',
        ]);
    }

    public function test_non_existent_ticket_returns_404(): void
    {
        $response = $this->withHeaders(['X-Inbound-Secret' => self::WEBHOOK_SECRET])
            ->postJson(route('api.webhooks.inbound-email'), [
                'From' => 'robin@relay.studio',
                'To' => 'reply+req-99999@inbound.relay.studio',
                'Subject' => 'Reply',
                'TextBody' => 'Hello',
            ]);

        $response->assertStatus(404)
            ->assertJsonPath('error', 'Work request #REQ-99999 not found.');
    }

    public function test_unknown_sender_email_returns_422(): void
    {
        $response = $this->withHeaders(['X-Inbound-Secret' => self::WEBHOOK_SECRET])
            ->postJson(route('api.webhooks.inbound-email'), [
                'From' => 'stranger@external.com',
                'To' => "reply+req-{$this->ticket->id}@inbound.relay.studio",
                'Subject' => 'Unknown sender message',
                'TextBody' => 'Who am I?',
            ]);

        $response->assertStatus(422);
    }

    public function test_html_in_comment_is_sanitized(): void
    {
        $response = $this->withHeaders(['X-Inbound-Secret' => self::WEBHOOK_SECRET])
            ->postJson(route('api.webhooks.inbound-email'), [
                'From' => 'robin@relay.studio',
                'To' => "reply+req-{$this->ticket->id}@inbound.relay.studio",
                'Subject' => 'Re: Update on task',
                'StrippedTextReply' => '<script>alert("xss")</script>Hello <b>World</b>',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('request_activities', [
            'request_id' => $this->ticket->id,
            'user_id' => $this->user->id,
            'type' => 'comment',
            'body' => 'Hello World',
        ]);
    }
}
