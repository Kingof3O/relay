<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\Workspace;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class AgentHubAndMcpHardeningTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Workspace $workspace;

    private Area $area;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        $this->user = User::query()->where('username', 'robin')->firstOrFail();
        $this->workspace = Workspace::query()->firstOrCreate(
            ['slug' => 'agent-test-workspace'],
            ['name' => 'Agent Workspace', 'owner_id' => $this->user->id]
        );
        $this->user->workspaces()->syncWithoutDetaching([$this->workspace->id => ['role_id' => $this->user->role_id]]);
        session(['active_workspace_id' => $this->workspace->id]);

        $this->area = Area::query()->firstOrCreate(
            ['slug' => 'backend-core'],
            ['name' => 'Backend Core', 'workspace_id' => $this->workspace->id, 'color' => '#8B5CF6']
        );
    }

    public function test_agent_hub_page_renders_successfully(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('agents.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Agents/Index')
            ->has('tools')
            ->has('agentActivities')
            ->has('tokens')
            ->where('workspace.id', $this->workspace->id)
        );
    }

    public function test_mcp_create_task_records_agent_action_activity(): void
    {
        $token = $this->user->createToken('Claude Agent', ['requests:write']);

        $response = $this->withHeader('Authorization', 'Bearer '.$token->plainTextToken)
            ->withHeader('X-Relay-Agent', 'mcp-server')
            ->withHeader('X-Relay-Tool', 'relay_create_task')
            ->postJson('/api/v1/work-requests', [
                'title' => 'Implement agent authentication flow',
                'area_id' => $this->area->id,
                'priority' => 'urgent',
                'description' => 'Auto-created by autonomous Claude agent',
            ]);

        $response->assertCreated();
        $taskId = $response->json('data.id');

        $task = WorkRequest::findOrFail($taskId);
        $this->assertEquals('Implement agent authentication flow', $task->title);

        // Verify agent_action activity was recorded
        $agentActivity = $task->activities()->where('type', 'agent_action')->first();
        $this->assertNotNull($agentActivity);
        $this->assertEquals('relay_create_task', $agentActivity->metadata['tool']);
        $this->assertTrue($agentActivity->metadata['is_agent']);
        $this->assertEquals('Claude Agent', $agentActivity->metadata['token_name']);
    }

    public function test_mcp_update_task_records_agent_action_activity(): void
    {
        $task = WorkRequest::query()->create([
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'title' => 'Refactor database indexing',
            'status' => 'new',
            'priority' => 'normal',
            'requester_id' => $this->user->id,
        ]);

        $token = $this->user->createToken('Cursor Agent', ['requests:write']);

        $response = $this->withHeader('Authorization', 'Bearer '.$token->plainTextToken)
            ->withHeader('X-Relay-Agent', 'mcp-server')
            ->withHeader('X-Relay-Tool', 'relay_update_task')
            ->patchJson("/api/v1/work-requests/{$task->id}", [
                'status' => 'doing',
                'story_points' => 3,
            ]);

        $response->assertOk();

        $agentActivity = $task->activities()->where('type', 'agent_action')->first();
        $this->assertNotNull($agentActivity);
        $this->assertEquals('relay_update_task', $agentActivity->metadata['tool']);
        $this->assertTrue($agentActivity->metadata['is_agent']);
        $this->assertEquals('Cursor Agent', $agentActivity->metadata['token_name']);
        $this->assertContains('status', $agentActivity->metadata['fields_updated']);
        $this->assertContains('story_points', $agentActivity->metadata['fields_updated']);
    }

    public function test_mcp_add_comment_records_agent_metadata(): void
    {
        $task = WorkRequest::query()->create([
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'title' => 'Audit performance logs',
            'status' => 'doing',
            'priority' => 'normal',
            'requester_id' => $this->user->id,
        ]);

        $token = $this->user->createToken('Antigravity Agent', ['requests:write']);

        $response = $this->withHeader('Authorization', 'Bearer '.$token->plainTextToken)
            ->withHeader('X-Relay-Agent', 'mcp-server')
            ->withHeader('X-Relay-Tool', 'relay_add_comment')
            ->postJson("/api/v1/work-requests/{$task->id}/comments", [
                'body' => 'Profiled database queries: 12ms average latency.',
            ]);

        $response->assertCreated();

        $comment = $task->activities()->where('type', 'comment')->first();
        $this->assertNotNull($comment);
        $this->assertTrue($comment->metadata['is_agent']);
        $this->assertEquals('relay_add_comment', $comment->metadata['tool']);
        $this->assertEquals('Antigravity Agent', $comment->metadata['token_name']);
    }
}
