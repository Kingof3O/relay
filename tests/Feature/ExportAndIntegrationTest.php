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
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

final class ExportAndIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_get_requests_export_format_csv_returns_200_with_text_csv_header_and_ticket_data(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $ticket = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Exportable Telemetry Infrastructure',
            'description' => 'Verify CSV export integrity.',
            'status' => RequestStatus::New,
            'priority' => RequestPriority::Urgent,
            'requester_id' => $user->id,
            'assignee_id' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('requests.export', ['format' => 'csv']));

        $response->assertOk();
        $this->assertStringContainsString('text/csv', (string) $response->headers->get('Content-Type'));
        $this->assertStringContainsString('attachment; filename="relay-backlog-export.csv"', (string) $response->headers->get('Content-Disposition'));

        $streamContent = $response->streamedContent();
        $this->assertStringContainsString('ID,Title,Project,Status,Priority,Assignee,Requester,Due Date,Created At', $streamContent);
        $this->assertStringContainsString('Exportable Telemetry Infrastructure', $streamContent);
        $this->assertStringContainsString($area->name, $streamContent);

        // Also verify JSON export
        $jsonResponse = $this->actingAs($user)
            ->get(route('requests.export', ['format' => 'json']));

        $jsonResponse->assertOk();
        $this->assertStringContainsString('application/json', (string) $jsonResponse->headers->get('Content-Type'));
        $this->assertStringContainsString('Exportable Telemetry Infrastructure', $jsonResponse->streamedContent());
    }

    public function test_github_webhook_autolinks_commit_message_and_updates_request_status(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $ticket = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Fix Crash on Startup',
            'description' => 'App crashes when config is null.',
            'status' => RequestStatus::New,
            'priority' => RequestPriority::Urgent,
            'requester_id' => $user->id,
            'assignee_id' => $user->id,
        ]);

        $commitHash = 'f00ba12';
        $commitMessage = "Fix crash (fixes #REQ-{$ticket->id})";

        $response = $this->postJson(route('api.webhooks.github'), [
            'commits' => [
                [
                    'id' => $commitHash,
                    'message' => $commitMessage,
                    'url' => "https://github.com/relay/relay/commit/{$commitHash}",
                ],
            ],
        ]);

        $response->assertOk()
            ->assertJson([
                'status' => 'success',
                'linked' => 1,
            ]);

        $ticket->refresh();

        // Status transitioned to review
        $this->assertEquals(RequestStatus::Review, $ticket->status);

        // Activity recorded
        $this->assertDatabaseHas('request_activities', [
            'request_id' => $ticket->id,
            'type' => 'github_commit',
            'body' => "GitHub: Commit {$commitHash} ({$commitMessage}) linked.",
        ]);
    }

    public function test_dispatch_outgoing_webhook_formats_and_sends_payload_for_urgent_or_blocked_tickets(): void
    {
        Http::fake();

        $user = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $ticket = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Critical Memory Exhaustion',
            'description' => 'Node process running out of heap space.',
            'status' => RequestStatus::New,
            'priority' => RequestPriority::Urgent,
            'requester_id' => $user->id,
            'assignee_id' => $user->id,
            'is_blocked' => true,
            'blocked_reason' => 'Waiting on cloud quota increase',
        ]);

        $webhook = Webhook::query()->create([
            'name' => 'Ops Slack Alerts',
            'url' => 'https://hooks.slack.com/services/TEST/TOKEN/XYZ',
            'events' => ['ticket.urgent', 'ticket.blocked'],
            'is_active' => true,
        ]);

        $job = new DispatchOutgoingWebhook($ticket->id);
        $job->handle();

        Http::assertSent(function (Request $request) use ($webhook, $ticket): bool {
            return $request->url() === $webhook->url
                && str_contains($request['text'], "[BLOCKED] #REQ-{$ticket->id}")
                && str_contains($request['blocks'][0]['text']['text'], 'Waiting on cloud quota increase');
        });
    }
}
