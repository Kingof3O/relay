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

final class WorkRequestQuickViewTest extends TestCase
{
    use RefreshDatabase;

    public function test_quick_view_receives_json_payload(): void
    {
        $this->seed(IndependentWorkspaceSeeder::class);

        $user = User::query()->where('username', 'robin')->firstOrFail();
        $workspace = Workspace::query()->firstOrCreate(
            ['slug' => 'test-qv-ws'],
            ['name' => 'Test QV Workspace', 'owner_id' => $user->id]
        );
        $user->workspaces()->syncWithoutDetaching([$workspace->id => ['role_id' => $user->role_id]]);
        session(['active_workspace_id' => $workspace->id]);

        $area = Area::query()->firstOrCreate(
            ['slug' => 'test-qv-area', 'workspace_id' => $workspace->id],
            ['name' => 'Test Project']
        );

        $assignee = User::query()->where('username', 'batman')->first() ?? $user;

        $workRequest = WorkRequest::query()->create([
            'title' => 'Quick View Test Task',
            'workspace_id' => $workspace->id,
            'area_id' => $area->id,
            'requester_id' => $user->id,
            'assignee_id' => $assignee->id,
            'status' => 'ready',
            'priority' => 'normal',
            'description' => 'Detailed description for quick view modal.',
        ]);

        $response = $this->actingAs($user)->getJson(route('requests.show', $workRequest));

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/json')
            ->assertJsonPath('request.id', $workRequest->id)
            ->assertJsonPath('request.title', 'Quick View Test Task')
            ->assertJsonPath('request.description', 'Detailed description for quick view modal.')
            ->assertJsonPath('request.status', 'ready')
            ->assertJsonPath('request.area_id', $area->id)
            ->assertJsonPath('request.project_id', $area->id)
            ->assertJsonPath('request.project.name', 'Test Project')
            ->assertJsonPath('request.assignee_id', $assignee->id)
            ->assertJsonPath('request.assignee.name', $assignee->name);
    }
}
