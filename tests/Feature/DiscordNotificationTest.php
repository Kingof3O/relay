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
use Illuminate\Support\Facades\Http;
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
                && $data['username'] === 'Relay Test Bot'
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
        ]);
        config(['services.discord.webhook_url' => null]);

        $this->artisan('relay:discord-test')
            ->expectsOutputToContain('Error: No Discord Webhook URL configured.')
            ->assertExitCode(1);
    }
}
