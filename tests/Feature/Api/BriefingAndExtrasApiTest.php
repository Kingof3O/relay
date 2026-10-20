<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\Area;
use App\Models\Cycle;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\Workspace;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class BriefingAndExtrasApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Workspace $workspace;

    private Area $area;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        $this->user = User::query()->where('username', 'robin')->firstOrFail();
        $this->workspace = Workspace::query()->firstOrCreate(
            ['slug' => 'api-test-workspace'],
            ['name' => 'API Test Workspace', 'owner_id' => $this->user->id]
        );
        $this->user->workspaces()->syncWithoutDetaching([$this->workspace->id => ['role_id' => $this->user->role_id]]);
        session(['active_workspace_id' => $this->workspace->id]);

        $this->token = $this->user->createToken('test-api-token')->plainTextToken;
        $this->area = Area::query()->firstOrCreate(
            ['slug' => 'test-area-api', 'workspace_id' => $this->workspace->id],
            ['name' => 'Test Project', 'color' => '#8B5CF6']
        );
    }

    public function test_briefing_requires_authentication(): void
    {
        $this->getJson('/api/v1/briefing')->assertUnauthorized();
    }

    public function test_briefing_returns_correct_metrics_and_tasks(): void
    {
        // 1. Create an urgent task
        WorkRequest::query()->create([
            'title' => 'Urgent Production Bug',
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'requester_id' => $this->user->id,
            'assignee_id' => $this->user->id,
            'status' => 'doing',
            'priority' => 'urgent',
            'story_points' => 5,
        ]);

        // 2. Create a blocked task
        WorkRequest::query()->create([
            'title' => 'Blocked Waiting on Assets',
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'requester_id' => $this->user->id,
            'status' => 'ready',
            'priority' => 'normal',
            'is_blocked' => true,
            'blocked_reason' => 'Waiting for 3D model export',
            'story_points' => 3,
        ]);

        // 3. Create a normal done task
        WorkRequest::query()->create([
            'title' => 'Completed Feature',
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'requester_id' => $this->user->id,
            'status' => 'done',
            'priority' => 'low',
            'story_points' => 2,
        ]);

        // 4. Create an active cycle
        $cycle = Cycle::query()->create([
            'workspace_id' => $this->workspace->id,
            'number' => 1,
            'name' => 'Sprint 1',
            'start_date' => now()->subDays(2)->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token)->getJson('/api/v1/briefing');

        $response->assertOk()
            ->assertJsonPath('workspace.id', $this->workspace->id)
            ->assertJsonPath('metrics.urgent', 1)
            ->assertJsonPath('metrics.blocked', 1)
            ->assertJsonPath('metrics.in_progress', 1)
            ->assertJsonPath('active_cycle.name', 'Sprint 1');

        $urgentList = $response->json('urgent_and_blocked');
        $this->assertCount(2, $urgentList);
    }

    public function test_briefing_does_not_leak_other_workspaces(): void
    {
        $otherWorkspace = Workspace::query()->create([
            'name' => 'Secret Other Workspace',
            'slug' => 'secret-other',
            'owner_id' => $this->user->id,
        ]);

        $otherArea = Area::query()->create([
            'name' => 'Other Project',
            'slug' => 'other-proj',
            'workspace_id' => $otherWorkspace->id,
        ]);

        WorkRequest::query()->create([
            'title' => 'Secret Other Task',
            'workspace_id' => $otherWorkspace->id,
            'area_id' => $otherArea->id,
            'requester_id' => $this->user->id,
            'status' => 'doing',
            'priority' => 'urgent',
        ]);

        $response = $this->withToken($this->token)->getJson('/api/v1/briefing');

        $response->assertOk();
        $titles = collect($response->json('urgent_and_blocked'))->pluck('title')->all();
        $this->assertNotContains('Secret Other Task', $titles);
    }

    public function test_comments_api_flow(): void
    {
        $request = WorkRequest::query()->create([
            'title' => 'Ticket with discussion',
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'requester_id' => $this->user->id,
            'status' => 'ready',
        ]);

        // Post comment
        $postRes = $this->withToken($this->token)->postJson("/api/v1/work-requests/{$request->id}/comments", [
            'body' => 'Investigating this issue now.',
        ]);

        $postRes->assertCreated()
            ->assertJsonPath('comment.body', 'Investigating this issue now.')
            ->assertJsonPath('comment.user.id', $this->user->id);

        // Fetch comments
        $getRes = $this->withToken($this->token)->getJson("/api/v1/work-requests/{$request->id}/comments");

        $getRes->assertOk()
            ->assertJsonCount(1, 'comments')
            ->assertJsonPath('comments.0.body', 'Investigating this issue now.');
    }

    public function test_cycles_api_flow(): void
    {
        Cycle::query()->create([
            'workspace_id' => $this->workspace->id,
            'number' => 10,
            'name' => 'Cycle Ten',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
            'is_active' => true,
        ]);

        $listRes = $this->withToken($this->token)->getJson('/api/v1/cycles');
        $listRes->assertOk()->assertJsonCount(1, 'data');

        $currentRes = $this->withToken($this->token)->getJson('/api/v1/cycles/current');
        $currentRes->assertOk()->assertJsonPath('active_cycle.name', 'Cycle Ten');
    }
}
