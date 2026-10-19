<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\DispatchOutgoingWebhook;
use App\Models\Area;
use App\Models\User;
use App\Models\Webhook;
use App\Models\WorkRequest;
use App\Models\Workspace;
use App\Support\UrlSecurity;
use Database\Seeders\DemoWorkspaceSeeder;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

final class DiscordSsrfTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Workspace $workspace;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([IndependentWorkspaceSeeder::class, DemoWorkspaceSeeder::class]);

        $this->user = User::query()->where('username', 'robin')->firstOrFail();
        $this->workspace = $this->user->workspaces()->firstOrFail();
        session(['active_workspace_id' => $this->workspace->id]);
    }

    public function test_url_security_detects_unsafe_loopback_and_metadata_ips(): void
    {
        $this->assertFalse(UrlSecurity::isSafeOutgoingUrl('http://127.0.0.1:8080/internal'));
        $this->assertFalse(UrlSecurity::isSafeOutgoingUrl('http://localhost:3000/api'));
        $this->assertFalse(UrlSecurity::isSafeOutgoingUrl('http://169.254.169.254/latest/meta-data/'));
        $this->assertFalse(UrlSecurity::isSafeOutgoingUrl('http://10.0.0.1/webhook'));
        $this->assertFalse(UrlSecurity::isSafeOutgoingUrl('http://192.168.1.1/admin'));
        $this->assertFalse(UrlSecurity::isSafeOutgoingUrl('http://172.16.0.1/test'));

        $this->assertTrue(UrlSecurity::isSafeOutgoingUrl('https://discord.com/api/webhooks/123/token'));
        $this->assertTrue(UrlSecurity::isSafeOutgoingUrl('https://hooks.slack.com/services/T/B/X'));
    }

    public function test_discord_url_security_requires_https_and_discord_domain(): void
    {
        $this->assertFalse(UrlSecurity::isSafeDiscordWebhookUrl('http://discord.com/api/webhooks/123/token')); // http
        $this->assertFalse(UrlSecurity::isSafeDiscordWebhookUrl('https://evil-discord.com/api/webhooks/123/token'));
        $this->assertFalse(UrlSecurity::isSafeDiscordWebhookUrl('https://discord.com/other/path'));
        $this->assertFalse(UrlSecurity::isSafeDiscordWebhookUrl('https://169.254.169.254/api/webhooks/123/token'));

        $this->assertTrue(UrlSecurity::isSafeDiscordWebhookUrl('https://discord.com/api/webhooks/123/token'));
        $this->assertTrue(UrlSecurity::isSafeDiscordWebhookUrl('https://discordapp.com/api/webhooks/123/token'));
    }

    public function test_test_discord_endpoint_rejects_ssrf_urls(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson(route('integrations.discord.test'), [
                'webhook_url' => 'http://169.254.169.254/latest/meta-data/',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['webhook_url']);
    }

    public function test_test_discord_endpoint_does_not_reflect_error_response_body(): void
    {
        Http::fake([
            'https://discord.com/api/webhooks/*' => Http::response('{"secret_upstream_stacktrace":"internal_detail"}', 400),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('integrations.discord.test'), [
                'webhook_url' => 'https://discord.com/api/webhooks/123/test-token',
            ]);

        $response->assertStatus(422);
        $this->assertStringNotContainsString('secret_upstream_stacktrace', (string) $response->getContent());
        $this->assertStringNotContainsString('internal_detail', (string) $response->getContent());
    }

    public function test_dispatch_outgoing_webhook_skips_ssrf_urls_and_scopes_to_workspace(): void
    {
        Http::fake();

        $area = Area::query()->where('workspace_id', $this->workspace->id)->firstOrFail();
        $ticket = WorkRequest::query()->create([
            'workspace_id' => $this->workspace->id,
            'area_id' => $area->id,
            'requester_id' => $this->user->id,
            'title' => 'SSRF Webhook Dispatch Test',
            'status' => 'new',
            'priority' => 'urgent',
            'is_blocked' => true,
            'blocked_reason' => 'Testing SSRF safety',
        ]);

        // Unsafe webhook in same workspace
        Webhook::query()->create([
            'workspace_id' => $this->workspace->id,
            'name' => 'Internal Metadata Webhook',
            'url' => 'http://169.254.169.254/latest/meta-data/',
            'is_active' => true,
        ]);

        // Webhook in another workspace
        $otherWorkspace = Workspace::query()->where('id', '!=', $this->workspace->id)->firstOrFail();
        $otherWebhook = Webhook::query()->create([
            'workspace_id' => $otherWorkspace->id,
            'name' => 'Other Tenant Webhook',
            'url' => 'https://hooks.slack.com/services/OTHER/TENANT/HOOK',
            'is_active' => true,
        ]);

        // Safe webhook in this workspace
        $safeWebhook = Webhook::query()->create([
            'workspace_id' => $this->workspace->id,
            'name' => 'This Tenant Safe Webhook',
            'url' => 'https://hooks.slack.com/services/SAFE/TENANT/HOOK',
            'is_active' => true,
        ]);

        $job = new DispatchOutgoingWebhook($ticket->id);
        $job->handle();

        // Safe webhook was sent
        Http::assertSent(fn ($req) => $req->url() === $safeWebhook->url);

        // SSRF webhook was blocked
        Http::assertNotSent(fn ($req) => str_contains($req->url(), '169.254.169.254'));

        // Cross-tenant webhook was not sent
        Http::assertNotSent(fn ($req) => $req->url() === $otherWebhook->url);
    }
}
