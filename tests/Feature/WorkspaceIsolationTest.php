<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\Workspace;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class WorkspaceIsolationTest extends TestCase
{
    use RefreshDatabase;

    private User $userA;

    private Workspace $workspaceA;

    private Area $areaA;

    private User $userB;

    private Workspace $workspaceB;

    private Area $areaB;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        $devRole = Role::query()->where('name', 'Developer')->firstOrFail();

        // Workspace A
        $this->userA = User::query()->where('username', 'robin')->firstOrFail();
        $this->workspaceA = Workspace::query()->create([
            'name' => 'Workspace Alpha',
            'slug' => 'workspace-alpha',
            'owner_id' => $this->userA->id,
        ]);
        $this->workspaceA->users()->attach($this->userA->id, ['role_id' => $this->userA->role_id]);
        $this->areaA = Area::query()->create([
            'name' => 'Alpha Confidential Project',
            'slug' => 'alpha-confidential-project',
            'color' => '#10B981',
            'workspace_id' => $this->workspaceA->id,
        ]);

        // Workspace B
        $this->userB = User::factory()->create(['username' => 'tenant_b_user', 'role_id' => $devRole->id]);
        $this->workspaceB = Workspace::query()->create([
            'name' => 'Workspace Beta',
            'slug' => 'workspace-beta',
            'owner_id' => $this->userB->id,
        ]);
        $this->workspaceB->users()->attach($this->userB->id, ['role_id' => $devRole->id]);
        $this->areaB = Area::query()->create([
            'name' => 'Beta Project Secret',
            'slug' => 'beta-project-secret',
            'color' => '#EF4444',
            'workspace_id' => $this->workspaceB->id,
        ]);

        $this->userA->refresh();
        $this->userB->refresh();
    }

    public function test_global_search_is_strictly_scoped_to_active_workspace(): void
    {
        // Ticket in Workspace A
        $ticketA = WorkRequest::query()->create([
            'title' => 'Alpha Unique Confidential Task',
            'area_id' => $this->areaA->id,
            'requester_id' => $this->userA->id,
            'workspace_id' => $this->workspaceA->id,
            'status' => 'new',
            'priority' => 'normal',
        ]);

        // Ticket in Workspace B
        $ticketB = WorkRequest::query()->create([
            'title' => 'Beta Unique Confidential Task',
            'area_id' => $this->areaB->id,
            'requester_id' => $this->userB->id,
            'workspace_id' => $this->workspaceB->id,
            'status' => 'new',
            'priority' => 'normal',
        ]);

        // Orphan ticket (null workspace_id created without events)
        $orphanTicket = WorkRequest::withoutEvents(function () {
            return WorkRequest::query()->forceCreate([
                'title' => 'Orphan Confidential Task',
                'area_id' => $this->areaA->id,
                'requester_id' => $this->userB->id,
                'workspace_id' => null,
                'status' => 'new',
                'priority' => 'normal',
            ]);
        });

        // User A searches for "Confidential"
        $response = $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->getJson(route('api.search', ['q' => 'Confidential']));

        $response->assertOk();
        $ticketIds = collect($response->json('requests'))->pluck('id')->all();

        $this->assertContains($ticketA->id, $ticketIds);
        $this->assertNotContains($ticketB->id, $ticketIds);
        $this->assertNotContains($orphanTicket->id, $ticketIds);

        // Verify project search isolation
        $projectIds = collect($response->json('projects'))->pluck('id')->all();
        $this->assertContains($this->areaA->id, $projectIds);
        $this->assertNotContains($this->areaB->id, $projectIds);
    }

    public function test_export_is_strictly_scoped_and_sanitizes_csv_formula_injection(): void
    {
        // Malicious ticket title with formula injection in Workspace A
        $maliciousTicket = WorkRequest::query()->create([
            'title' => '=CMD|"/C calc"!A0',
            'area_id' => $this->areaA->id,
            'requester_id' => $this->userA->id,
            'workspace_id' => $this->workspaceA->id,
            'status' => 'new',
            'priority' => 'urgent',
        ]);

        // Ticket in Workspace B
        $ticketB = WorkRequest::query()->create([
            'title' => 'Secret Beta Ticket That Must Not Leak',
            'area_id' => $this->areaB->id,
            'requester_id' => $this->userB->id,
            'workspace_id' => $this->workspaceB->id,
            'status' => 'new',
            'priority' => 'urgent',
        ]);

        $response = $this->actingAs($this->userA)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->get(route('requests.export', ['format' => 'csv']));

        $response->assertOk();
        $content = $response->streamedContent();

        // Must contain sanitized malicious formula (prefixed with single quote)
        $this->assertStringContainsString("'=CMD|\"\"/C calc\"\"!A0", $content);

        // Must NOT contain Workspace B ticket
        $this->assertStringNotContainsString('Secret Beta Ticket That Must Not Leak', $content);
    }

    public function test_api_v1_work_requests_and_projects_are_strictly_scoped(): void
    {
        $ticketA = WorkRequest::query()->create([
            'title' => 'Alpha API Ticket',
            'area_id' => $this->areaA->id,
            'requester_id' => $this->userA->id,
            'workspace_id' => $this->workspaceA->id,
            'status' => 'new',
            'priority' => 'normal',
        ]);

        $ticketB = WorkRequest::query()->create([
            'title' => 'Beta API Ticket',
            'area_id' => $this->areaB->id,
            'requester_id' => $this->userB->id,
            'workspace_id' => $this->workspaceB->id,
            'status' => 'new',
            'priority' => 'normal',
        ]);

        $tokenA = $this->userA->createToken('test-token-a')->plainTextToken;

        // Test API work-requests list
        $reqResponse = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson('/api/v1/work-requests');

        $reqResponse->assertOk();
        $apiTicketIds = collect($reqResponse->json('data'))->pluck('id')->all();

        $this->assertContains($ticketA->id, $apiTicketIds);
        $this->assertNotContains($ticketB->id, $apiTicketIds);

        // Test API projects list
        $projResponse = $this->withHeader('Authorization', 'Bearer '.$tokenA)
            ->getJson('/api/v1/projects');

        $projResponse->assertOk();
        $apiProjectIds = collect($projResponse->json('data'))->pluck('id')->all();

        $this->assertContains($this->areaA->id, $apiProjectIds);
        $this->assertNotContains($this->areaB->id, $apiProjectIds);
    }

    public function test_work_request_policy_rejects_cross_tenant_access(): void
    {
        $ticketB = WorkRequest::query()->create([
            'title' => 'Beta Secret Task',
            'area_id' => $this->areaB->id,
            'requester_id' => $this->userB->id,
            'workspace_id' => $this->workspaceB->id,
            'status' => 'new',
            'priority' => 'normal',
        ]);

        // User A cannot view Ticket B
        $this->assertFalse($this->userA->can('view', $ticketB));

        // User A cannot update Ticket B
        $this->assertFalse($this->userA->can('update', $ticketB));

        // User A cannot delete Ticket B
        $this->assertFalse($this->userA->can('delete', $ticketB));

        // User A cannot comment on Ticket B
        $this->assertFalse($this->userA->can('comment', $ticketB));
    }
}
