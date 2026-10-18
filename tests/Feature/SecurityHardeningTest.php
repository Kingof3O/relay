<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use App\Jobs\DispatchOutgoingWebhook;
use App\Models\Area;
use App\Models\User;
use App\Models\Webhook;
use App\Models\WorkRequest;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

final class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_api_search_requires_authentication(): void
    {
        $response = $this->getJson('/api/search?q=test');
        $response->assertUnauthorized();
    }

    public function test_api_search_allows_authenticated_web_session(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();

        $response = $this->actingAs($user)->getJson('/api/search?q=');
        $response->assertOk();
    }

    public function test_api_search_allows_sanctum_token(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/search?q=');

        $response->assertOk();
    }

    public function test_github_webhook_rejects_missing_signature_when_secret_is_configured(): void
    {
        Config::set('services.github.webhook_secret', 'super-secret-key-12345');

        $response = $this->postJson(route('api.webhooks.github'), [
            'commits' => [],
        ]);

        $response->assertStatus(401);
    }

    public function test_github_webhook_rejects_invalid_signature_when_secret_is_configured(): void
    {
        Config::set('services.github.webhook_secret', 'super-secret-key-12345');

        $payload = json_encode(['commits' => []]);

        $response = $this->call(
            'POST',
            route('api.webhooks.github'),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_HUB_SIGNATURE_256' => 'sha256=invalidhashvalue1234567890',
            ],
            $payload
        );

        $response->assertStatus(401);
    }

    public function test_github_webhook_accepts_valid_signature_and_processes_commit(): void
    {
        $secret = 'super-secret-key-12345';
        Config::set('services.github.webhook_secret', $secret);

        $user = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $ticket = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Signature Validation Ticket',
            'description' => 'Test HMAC verification',
            'status' => RequestStatus::New,
            'priority' => RequestPriority::Urgent,
            'requester_id' => $user->id,
        ]);

        $commitHash = 'abc1234';
        $commitMessage = "Fixed problem (fixes #REQ-{$ticket->id})";
        $payload = json_encode([
            'commits' => [
                [
                    'id' => $commitHash,
                    'message' => $commitMessage,
                    'url' => "https://github.com/relay/relay/commit/{$commitHash}",
                ],
            ],
        ]);

        $validSignature = 'sha256='.hash_hmac('sha256', (string) $payload, $secret);

        $response = $this->call(
            'POST',
            route('api.webhooks.github'),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_HUB_SIGNATURE_256' => $validSignature,
            ],
            $payload
        );

        $response->assertOk()
            ->assertJson([
                'status' => 'success',
                'linked' => 1,
            ]);

        $ticket->refresh();
        $this->assertEquals(RequestStatus::Review, $ticket->status);
    }

    public function test_dispatch_outgoing_webhook_attaches_hmac_signature_header(): void
    {
        Http::fake();

        $user = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $ticket = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'HMAC Outgoing Test',
            'description' => 'Verify outgoing signature',
            'status' => RequestStatus::New,
            'priority' => RequestPriority::Urgent,
            'requester_id' => $user->id,
            'is_blocked' => true,
            'blocked_reason' => 'Waiting on review',
        ]);

        $webhookSecret = 'outgoing-secret-98765';
        $webhook = Webhook::query()->create([
            'name' => 'Signed Slack Alert',
            'url' => 'https://hooks.slack.com/services/SIGNED/TOKEN/XYZ',
            'secret' => $webhookSecret,
            'events' => ['ticket.urgent', 'ticket.blocked'],
            'is_active' => true,
        ]);

        $job = new DispatchOutgoingWebhook($ticket->id);
        $job->handle();

        Http::assertSent(function (Request $request) use ($webhook, $webhookSecret): bool {
            if ($request->url() !== $webhook->url) {
                return false;
            }

            if (! $request->hasHeader('X-Relay-Signature')) {
                return false;
            }

            $signatureHeader = $request->header('X-Relay-Signature')[0] ?? '';
            $expectedSignature = 'sha256='.hash_hmac('sha256', (string) json_encode($request->data()), $webhookSecret);

            return hash_equals($expectedSignature, $signatureHeader);
        });
    }

    public function test_login_route_is_throttled_at_six_attempts_per_minute(): void
    {
        // 6 attempts should not hit the throttle middleware limit (though invalid credentials may return validation errors)
        for ($i = 0; $i < 6; $i++) {
            $response = $this->post('/login', [
                'username' => "nonexistent_user_{$i}",
                'password' => 'wrong-password',
            ]);
            // Either redirect back with error or validation response, not 429
            $this->assertNotEquals(429, $response->getStatusCode());
        }

        // 7th attempt hits the throttle:6,1 middleware limit
        $seventhResponse = $this->post('/login', [
            'username' => 'nonexistent_user_7',
            'password' => 'wrong-password',
        ]);

        $this->assertEquals(429, $seventhResponse->getStatusCode());
    }
}
