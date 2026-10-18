<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Mail\WorkRequestNotificationMail;
use App\Models\Role;
use App\Models\User;
use App\Services\DiscordNotificationService;
use App\Services\EmailNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

final class IntegrationsDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;

    protected User $developer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->owner = User::query()->where('role_id', Role::query()->where('name', 'owner')->value('id'))->first()
            ?? User::factory()->create(['role_id' => Role::query()->where('name', 'owner')->value('id')]);

        $this->developer = User::query()->where('role_id', Role::query()->where('name', 'developer')->value('id'))->first()
            ?? User::factory()->create(['role_id' => Role::query()->where('name', 'developer')->value('id')]);
    }

    public function test_owner_can_access_integrations_dashboard(): void
    {
        $response = $this->actingAs($this->owner)->get(route('integrations.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Integrations/Index')
            ->has('discord')
            ->has('email')
            ->has('logs')
            ->has('kpis')
        );
    }

    public function test_owner_can_update_discord_settings(): void
    {
        $response = $this->actingAs($this->owner)->postJson(route('integrations.discord.update'), [
            'enabled' => true,
            'webhook_url' => 'https://discord.com/api/webhooks/999/super-secret-token',
            'bot_name' => 'Custom Dispatcher',
            'avatar_url' => 'https://example.com/bot.png',
            'events' => [
                'ticket_created' => true,
                'ticket_status' => false,
            ],
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('discord.enabled', true);
        $response->assertJsonPath('discord.bot_name', 'Custom Dispatcher');

        $this->assertTrue(DiscordNotificationService::isEnabled());
        $this->assertSame('Custom Dispatcher', DiscordNotificationService::getBotName());
    }

    public function test_owner_can_ping_discord_webhook(): void
    {
        Http::fake([
            'https://discord.com/api/webhooks/*' => Http::response(null, 204),
        ]);

        $response = $this->actingAs($this->owner)->postJson(route('integrations.discord.test'), [
            'webhook_url' => 'https://discord.com/api/webhooks/999/ping-test-token',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        Http::assertSent(fn ($req) => str_contains($req->url(), 'ping-test-token'));
    }

    public function test_owner_can_update_email_template_settings(): void
    {
        $response = $this->actingAs($this->owner)->postJson(route('integrations.email.update'), [
            'sender_name' => 'Acme Dispatch',
            'accent_color' => '#10B981',
            'footer_note' => 'Confidential · Acme Corporation',
            'events' => [
                'ticket_created' => true,
                'ticket_status' => true,
            ],
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('email.sender_name', 'Acme Dispatch');
        $response->assertJsonPath('email.accent_color', '#10B981');

        $this->assertSame('Acme Dispatch', EmailNotificationService::getSenderName());
        $this->assertSame('#10B981', EmailNotificationService::getAccentColor());
    }

    public function test_owner_can_send_test_email(): void
    {
        Mail::fake();

        $response = $this->actingAs($this->owner)->postJson(route('integrations.email.test'), [
            'event' => 'assignment',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        Mail::assertQueued(WorkRequestNotificationMail::class);
    }

    public function test_owner_can_preview_email_template_html(): void
    {
        $response = $this->actingAs($this->owner)->get(route('integrations.email.preview', ['event' => 'review']));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/html; charset=UTF-8');
        $this->assertStringContainsString('<!DOCTYPE html', $response->getContent());
        $this->assertStringContainsString('REVIEW REQUESTED', $response->getContent());
    }

    public function test_unauthorized_user_cannot_access_integrations(): void
    {
        $designer = User::query()->where('role_id', Role::query()->where('name', 'Designer')->value('id'))->first()
            ?? User::factory()->create(['role_id' => Role::query()->where('name', 'Designer')->value('id')]);

        // User without manage_workspace permission
        $response = $this->actingAs($designer)->get(route('integrations.index'));

        $response->assertStatus(403);
    }
}
