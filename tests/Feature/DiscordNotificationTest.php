<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\SendDiscordNotification;
use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use App\Services\DiscordNotificationService;
use App\Services\WorkRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

final class DiscordNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_discord_notification_dispatches_when_enabled(): void
    {
        Http::fake([
            'https://discord.com/api/webhooks/*' => Http::response(null, 204),
        ]);

        DiscordNotificationService::updateSettings([
            'enabled' => true,
            'webhook_url' => 'https://discord.com/api/webhooks/123/fake-token',
            'bot_name' => 'Relay Test Bot',
        ]);

        $actor = User::query()->first();
        $project = Area::query()->first();

        $service = app(WorkRequestService::class);
        $request = $service->create($actor, [
            'area_id' => $project->id,
            'title' => 'Test Discord Alert Ticket',
            'description' => 'Verifying Discord webhook embed generation',
            'priority' => 'urgent',
        ]);

        // Manually run the job to test delivery
        (new SendDiscordNotification($request->id, [
            'event' => 'created',
            'request_id' => $request->id,
            'request_title' => $request->title,
            'message' => "{$actor->name} created #REQ-{$request->id}: {$request->title}",
        ]))->handle();

        Http::assertSent(function ($request) {
            $data = $request->data();

            return str_contains($request->url(), 'discord.com/api/webhooks')
                && ($data['username'] ?? null) === 'Relay Test Bot'
                && isset($data['embeds'][0])
                && str_contains($data['embeds'][0]['title'], 'Test Discord Alert Ticket');
        });

        $this->assertDatabaseHas('integration_delivery_logs', [
            'channel' => 'discord',
            'event' => 'created',
            'status' => 'success',
        ]);
    }

    public function test_discord_notification_skipped_when_disabled(): void
    {
        Http::fake();

        DiscordNotificationService::updateSettings([
            'enabled' => false,
            'webhook_url' => 'https://discord.com/api/webhooks/123/fake-token',
        ]);

        $request = WorkRequest::query()->first();

        (new SendDiscordNotification($request->id, [
            'event' => 'created',
            'request_id' => $request->id,
            'request_title' => $request->title,
        ]))->handle();

        Http::assertNothingSent();
    }

    public function test_cli_command_sends_test_embed(): void
    {
        Http::fake([
            'https://discord.com/api/webhooks/*' => Http::response(null, 204),
        ]);

        $this->artisan('relay:discord-test', [
            'webhook_url' => 'https://discord.com/api/webhooks/123/test-cli-token',
        ])
            ->expectsOutputToContain('RELAY STUDIO · DISCORD INTEGRATION TEST')
            ->expectsOutputToContain('Success: Test notification successfully delivered')
            ->assertExitCode(0);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'discord.com/api/webhooks/123/test-cli-token');
        });
    }

    public function test_cli_command_fails_gracefully_when_no_url(): void
    {
        DiscordNotificationService::updateSettings([
            'webhook_url' => '',
            'webhook_urls' => [],
        ]);
        config(['services.discord.webhook_url' => null, 'services.discord.webhook_urls' => null]);

        $this->artisan('relay:discord-test')
            ->expectsOutputToContain('Error: No Discord Webhook URL configured.')
            ->assertExitCode(1);
    }

    public function test_discord_notification_broadcasts_to_multiple_webhooks(): void
    {
        Http::fake([
            'https://discord.com/api/webhooks/channel-one/*' => Http::response(null, 204),
            'https://discord.com/api/webhooks/channel-two/*' => Http::response(null, 204),
        ]);

        DiscordNotificationService::updateSettings([
            'enabled' => true,
            'webhook_urls' => [
                'https://discord.com/api/webhooks/channel-one/token-1',
                'https://discord.com/api/webhooks/channel-two/token-2',
            ],
            'bot_name' => 'Multi Bot',
        ]);

        $request = WorkRequest::query()->first();

        (new SendDiscordNotification($request->id, [
            'event' => 'status_changed',
            'request_id' => $request->id,
            'request_title' => $request->title,
            'message' => 'Status changed from New to Ready.',
        ]))->handle();

        Http::assertSent(fn ($req) => str_contains($req->url(), 'channel-one/token-1'));
        Http::assertSent(fn ($req) => str_contains($req->url(), 'channel-two/token-2'));

        $this->assertDatabaseHas('integration_delivery_logs', [
            'channel' => 'discord',
            'event' => 'status_changed',
            'status' => 'success',
            'target' => DiscordNotificationService::maskUrl('https://discord.com/api/webhooks/channel-one/token-1'),
        ]);
        $this->assertDatabaseHas('integration_delivery_logs', [
            'channel' => 'discord',
            'event' => 'status_changed',
            'status' => 'success',
            'target' => DiscordNotificationService::maskUrl('https://discord.com/api/webhooks/channel-two/token-2'),
        ]);
    }

    public function test_discord_ping_multiple_webhooks(): void
    {
        Http::fake([
            'https://discord.com/api/webhooks/chan1/*' => Http::response(null, 204),
            'https://discord.com/api/webhooks/chan2/*' => Http::response(null, 204),
        ]);

        $result = DiscordNotificationService::ping([
            'https://discord.com/api/webhooks/chan1/abc',
            'https://discord.com/api/webhooks/chan2/def',
        ]);

        $this->assertTrue($result['success']);
        $this->assertStringContainsString('all 2 Discord channels', $result['message']);
        Http::assertSent(fn ($req) => str_contains($req->url(), 'chan1/abc'));
        Http::assertSent(fn ($req) => str_contains($req->url(), 'chan2/def'));
    }

    public function test_moving_ticket_through_kanban_statuses_dispatches_notifications(): void
    {
        Queue::fake([SendDiscordNotification::class]);

        $actor = User::query()->first();
        $project = Area::query()->first();
        $service = app(WorkRequestService::class);

        $request = $service->create($actor, [
            'area_id' => $project->id,
            'title' => 'Status Transition Lifecycle Ticket',
            'description' => 'Testing all Kanban moves',
            'status' => 'new',
        ]);

        // Move new -> ready
        $service->update($request, $actor, ['status' => 'ready']);
        Queue::assertPushed(SendDiscordNotification::class, function ($job) use ($request) {
            return $job->workRequestId === $request->id && $job->payload['event'] === 'status_changed'
                && str_contains($job->payload['message'], 'changed status from New to Ready');
        });

        // Move ready -> doing
        $service->update($request, $actor, ['status' => 'doing']);
        Queue::assertPushed(SendDiscordNotification::class, function ($job) use ($request) {
            return $job->workRequestId === $request->id && $job->payload['event'] === 'status_changed'
                && str_contains($job->payload['message'], 'changed status from Ready to Doing');
        });

        // Move doing -> review
        $service->update($request, $actor, ['status' => 'review']);
        Queue::assertPushed(SendDiscordNotification::class, function ($job) use ($request) {
            return $job->workRequestId === $request->id && $job->payload['event'] === 'review';
        });

        // Move review -> done
        $service->update($request, $actor, ['status' => 'done']);
        Queue::assertPushed(SendDiscordNotification::class, function ($job) use ($request) {
            return $job->workRequestId === $request->id && $job->payload['event'] === 'done';
        });

        // Reopen done -> doing
        $service->update($request, $actor, ['status' => 'doing']);
        Queue::assertPushed(SendDiscordNotification::class, function ($job) use ($request) {
            return $job->workRequestId === $request->id && $job->payload['event'] === 'reopened';
        });
    }

    public function test_integration_controller_endpoints_handle_multiple_webhooks(): void
    {
        Http::fake([
            'https://discord.com/api/webhooks/*' => Http::response(null, 204),
        ]);

        $user = User::query()->where('username', 'robin')->firstOrFail();

        $urls = [
            'https://discord.com/api/webhooks/dev-channel/abc12345678901234567890',
            'https://discord.com/api/webhooks/ops-channel/xyz12345678901234567890',
        ];

        // Test endpoint
        $testResponse = $this->actingAs($user)->postJson(route('integrations.discord.test'), [
            'webhook_urls' => $urls,
        ]);

        $testResponse->assertOk()
            ->assertJson(['success' => true]);

        // Save settings endpoint
        $saveResponse = $this->actingAs($user)->postJson(route('integrations.discord.update'), [
            'enabled' => true,
            'webhook_urls' => $urls,
            'bot_name' => 'MultiBot',
            'avatar_url' => null,
            'events' => [
                'ticket_created' => true,
                'ticket_status' => true,
            ],
        ]);

        $saveResponse->assertOk()
            ->assertJsonPath('discord.configured', true)
            ->assertJsonCount(2, 'discord.webhook_urls')
            ->assertJsonCount(2, 'discord.masked_webhook_urls');
    }

    public function test_discord_settings_survive_cache_clear(): void
    {
        $urls = [
            'https://discord.com/api/webhooks/persistent-one/token1111111111111111',
            'https://discord.com/api/webhooks/persistent-two/token2222222222222222',
        ];

        DiscordNotificationService::updateSettings([
            'enabled' => true,
            'webhook_urls' => $urls,
            'bot_name' => 'Permanent Bot',
        ]);

        // Completely flush the application cache (simulating php artisan optimize:clear or cache:clear on deploy)
        Cache::flush();

        // Verify settings and URLs are permanently retained from database
        $status = DiscordNotificationService::getStatus();
        $this->assertTrue($status['enabled']);
        $this->assertTrue($status['configured']);
        $this->assertSame('Permanent Bot', $status['bot_name']);
        $this->assertEquals($urls, $status['webhook_urls']);

        // Verify webhooks table is also populated
        $this->assertDatabaseHas('webhooks', [
            'name' => 'discord',
            'url' => $urls[0],
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('webhooks', [
            'name' => 'discord',
            'url' => $urls[1],
            'is_active' => true,
        ]);
    }
}
