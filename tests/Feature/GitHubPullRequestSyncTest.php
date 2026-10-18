<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\PullRequest;
use App\Models\User;
use App\Models\WorkRequest;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class GitHubPullRequestSyncTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private WorkRequest $ticket;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        $this->user = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $this->ticket = WorkRequest::query()->create([
            'title' => 'Implement Pull Request Syncing',
            'area_id' => $area->id,
            'requester_id' => $this->user->id,
            'status' => 'doing',
            'priority' => 'urgent',
        ]);
    }

    public function test_github_webhook_links_pr_to_work_request(): void
    {
        $response = $this->withHeader('X-GitHub-Event', 'pull_request')
            ->postJson(route('api.webhooks.github'), [
                'action' => 'opened',
                'pull_request' => [
                    'number' => 42,
                    'title' => "feat: implement feature #REQ-{$this->ticket->id}",
                    'body' => "Fixes #REQ-{$this->ticket->id} in full.",
                    'html_url' => 'https://github.com/relay/studio/pull/42',
                    'state' => 'open',
                    'draft' => false,
                    'review_status' => 'pending',
                    'head' => ['ref' => "feature/req-{$this->ticket->id}"],
                    'base' => ['ref' => 'main'],
                ],
            ]);

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('linked', 1);

        $this->assertDatabaseHas('pull_requests', [
            'work_request_id' => $this->ticket->id,
            'pr_number' => 42,
            'status' => 'open',
            'is_draft' => false,
            'url' => 'https://github.com/relay/studio/pull/42',
        ]);

        $this->assertDatabaseHas('request_activities', [
            'request_id' => $this->ticket->id,
            'type' => 'github_pr_linked',
        ]);
    }

    public function test_merging_pr_to_main_auto_closes_ticket_as_done(): void
    {
        $this->assertEquals('doing', $this->ticket->status->value);

        $response = $this->withHeader('X-GitHub-Event', 'pull_request')
            ->postJson(route('api.webhooks.github'), [
                'action' => 'closed',
                'pull_request' => [
                    'number' => 42,
                    'title' => "feat: PR ready for main #REQ-{$this->ticket->id}",
                    'body' => "Closes #REQ-{$this->ticket->id}",
                    'html_url' => 'https://github.com/relay/studio/pull/42',
                    'state' => 'closed',
                    'merged' => true,
                    'draft' => false,
                    'head' => ['ref' => "feature/req-{$this->ticket->id}"],
                    'base' => ['ref' => 'main'],
                ],
            ]);

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('merged', true);

        $this->ticket->refresh();
        $this->assertEquals('done', $this->ticket->status->value);

        $this->assertDatabaseHas('pull_requests', [
            'work_request_id' => $this->ticket->id,
            'pr_number' => 42,
            'status' => 'merged',
        ]);

        $this->assertDatabaseHas('request_activities', [
            'request_id' => $this->ticket->id,
            'type' => 'github_pr_merged',
        ]);
    }

    public function test_closing_pr_without_merge_does_not_mark_ticket_done(): void
    {
        $this->assertEquals('doing', $this->ticket->status->value);

        $response = $this->withHeader('X-GitHub-Event', 'pull_request')
            ->postJson(route('api.webhooks.github'), [
                'action' => 'closed',
                'pull_request' => [
                    'number' => 99,
                    'title' => "WIP discarded #REQ-{$this->ticket->id}",
                    'body' => "fixes #REQ-{$this->ticket->id}",
                    'html_url' => 'https://github.com/relay/studio/pull/99',
                    'state' => 'closed',
                    'merged' => false,
                    'draft' => false,
                    'head' => ['ref' => "feature/req-{$this->ticket->id}"],
                    'base' => ['ref' => 'main'],
                ],
            ]);

        $response->assertOk();

        $this->ticket->refresh();
        $this->assertEquals('doing', $this->ticket->status->value);

        $this->assertDatabaseHas('pull_requests', [
            'work_request_id' => $this->ticket->id,
            'pr_number' => 99,
            'status' => 'closed',
        ]);
    }

    public function test_ticket_detail_api_includes_linked_pull_requests(): void
    {
        PullRequest::query()->create([
            'work_request_id' => $this->ticket->id,
            'provider' => 'github',
            'pr_number' => 101,
            'title' => 'Awesome PR',
            'url' => 'https://github.com/relay/studio/pull/101',
            'status' => 'open',
            'is_draft' => false,
            'review_status' => 'approved',
        ]);

        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/work-requests/{$this->ticket->id}");

        $response->assertOk()
            ->assertJsonCount(1, 'data.pull_requests')
            ->assertJsonPath('data.pull_requests.0.pr_number', 101)
            ->assertJsonPath('data.pull_requests.0.status', 'open')
            ->assertJsonPath('data.pull_requests.0.review_status', 'approved');
    }
}
