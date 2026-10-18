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
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

final class MultiTenancyWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_user_can_create_a_new_workspace_and_is_enrolled_as_owner(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $ownerRole = Role::query()->where('name', 'Owner')->firstOrFail();

        $response = $this->actingAs($owner)->post(route('workspaces.store'), [
            'name' => 'Acme Games Studio',
        ]);

        $response->assertRedirect();

        $workspace = Workspace::query()->where('name', 'Acme Games Studio')->first();
        $this->assertNotNull($workspace);
        $this->assertSame('acme-games-studio', $workspace->slug);
        $this->assertSame($owner->id, $workspace->owner_id);

        $this->assertDatabaseHas('workspace_user', [
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'role_id' => $ownerRole->id,
        ]);

        $response->assertSessionHas('active_workspace_id', $workspace->id);
    }

    public function test_user_can_switch_active_workspace(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $ownerRole = Role::query()->where('name', 'Owner')->firstOrFail();

        $workspaceA = Workspace::query()->create([
            'name' => 'Workspace Alpha',
            'slug' => 'workspace-alpha',
            'owner_id' => $user->id,
        ]);
        $workspaceB = Workspace::query()->create([
            'name' => 'Workspace Beta',
            'slug' => 'workspace-beta',
            'owner_id' => $user->id,
        ]);

        $workspaceA->users()->attach($user->id, ['role_id' => $ownerRole->id]);
        $workspaceB->users()->attach($user->id, ['role_id' => $ownerRole->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspaceA->id])
            ->post(route('workspaces.switch', $workspaceB));

        $response->assertRedirect();
        $response->assertSessionHas('active_workspace_id', $workspaceB->id);
    }

    public function test_user_cannot_switch_to_workspace_they_do_not_belong_to(): void
    {
        $robin = User::query()->where('username', 'robin')->firstOrFail();
        $otherUser = User::query()->where('username', 'hussien')->firstOrFail();
        $ownerRole = Role::query()->where('name', 'Owner')->firstOrFail();

        $privateWorkspace = Workspace::query()->create([
            'name' => 'Private Vault',
            'slug' => 'private-vault',
            'owner_id' => $otherUser->id,
        ]);
        $privateWorkspace->users()->attach($otherUser->id, ['role_id' => $ownerRole->id]);

        $response = $this->actingAs($robin)->post(route('workspaces.switch', $privateWorkspace));

        $response->assertForbidden();
    }

    public function test_workspace_data_scoping_isolates_requests_between_workspaces(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $ownerRole = Role::query()->where('name', 'Owner')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $workspaceA = Workspace::query()->create([
            'name' => 'Engineering Studio',
            'slug' => 'engineering-studio',
            'owner_id' => $user->id,
        ]);
        $workspaceB = Workspace::query()->create([
            'name' => 'Marketing Studio',
            'slug' => 'marketing-studio',
            'owner_id' => $user->id,
        ]);

        $workspaceA->users()->attach($user->id, ['role_id' => $ownerRole->id]);
        $workspaceB->users()->attach($user->id, ['role_id' => $ownerRole->id]);

        $ticketA = WorkRequest::query()->create([
            'workspace_id' => $workspaceA->id,
            'area_id' => $area->id,
            'title' => 'Alpha Core Engine Pipeline',
            'requester_id' => $user->id,
            'status' => 'new',
            'priority' => 'urgent',
        ]);

        $ticketB = WorkRequest::query()->create([
            'workspace_id' => $workspaceB->id,
            'area_id' => $area->id,
            'title' => 'Beta Landing Page Graphics',
            'requester_id' => $user->id,
            'status' => 'new',
            'priority' => 'low',
        ]);

        // Scoped to Workspace A: sees Ticket A, does NOT see Ticket B
        $responseA = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspaceA->id])
            ->get(route('requests.index'));

        $responseA->assertOk();
        $responseA->assertInertia(fn (Assert $page) => $page
            ->component('Requests/Index')
            ->where('requests', fn ($requests) => collect($requests)->pluck('title')->contains('Alpha Core Engine Pipeline')
                && ! collect($requests)->pluck('title')->contains('Beta Landing Page Graphics')
            )
        );

        // Scoped to Workspace B: sees Ticket B, does NOT see Ticket A
        $responseB = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspaceB->id])
            ->get(route('requests.index'));

        $responseB->assertOk();
        $responseB->assertInertia(fn (Assert $page) => $page
            ->component('Requests/Index')
            ->where('requests', fn ($requests) => collect($requests)->pluck('title')->contains('Beta Landing Page Graphics')
                && ! collect($requests)->pluck('title')->contains('Alpha Core Engine Pipeline')
            )
        );
    }

    public function test_workspace_data_scoping_isolates_projects_and_initiatives(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $ownerRole = Role::query()->where('name', 'Owner')->firstOrFail();

        $workspaceA = Workspace::query()->create([
            'name' => 'Studio Alpha',
            'slug' => 'studio-alpha',
            'owner_id' => $user->id,
        ]);
        $workspaceB = Workspace::query()->create([
            'name' => 'Studio Beta',
            'slug' => 'studio-beta',
            'owner_id' => $user->id,
        ]);

        $workspaceA->users()->attach($user->id, ['role_id' => $ownerRole->id]);
        $workspaceB->users()->attach($user->id, ['role_id' => $ownerRole->id]);

        $areaA = Area::query()->create([
            'workspace_id' => $workspaceA->id,
            'name' => 'Alpha Exclusives',
            'slug' => 'alpha-exclusives',
            'color' => '#3B82F6',
            'sort_order' => 10,
        ]);

        $areaB = Area::query()->create([
            'workspace_id' => $workspaceB->id,
            'name' => 'Beta Exclusives',
            'slug' => 'beta-exclusives',
            'color' => '#10B981',
            'sort_order' => 11,
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspaceA->id])
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('workspaceProjects', fn ($projects) => collect($projects)->pluck('name')->contains('Alpha Exclusives')
                && ! collect($projects)->pluck('name')->contains('Beta Exclusives')
            )
        );
    }

    public function test_inertia_shares_current_workspace_and_user_workspaces(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $ownerRole = Role::query()->where('name', 'Owner')->firstOrFail();

        $workspace1 = Workspace::query()->create([
            'name' => 'HQ One',
            'slug' => 'hq-one',
            'owner_id' => $user->id,
        ]);
        $workspace2 = Workspace::query()->create([
            'name' => 'HQ Two',
            'slug' => 'hq-two',
            'owner_id' => $user->id,
        ]);

        $workspace1->users()->attach($user->id, ['role_id' => $ownerRole->id]);
        $workspace2->users()->attach($user->id, ['role_id' => $ownerRole->id]);

        $response = $this->actingAs($user)
            ->withSession(['active_workspace_id' => $workspace2->id])
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('currentWorkspace.id', $workspace2->id)
            ->where('currentWorkspace.name', 'HQ Two')
            ->has('userWorkspaces', 2)
        );
    }

    public function test_user_current_workspace_resolution_fallback_to_first(): void
    {
        $user = User::query()->where('username', 'hussien')->firstOrFail();
        $devRole = Role::query()->where('name', 'Developer')->firstOrFail();

        $workspace = Workspace::query()->create([
            'name' => 'Fallback Workspace',
            'slug' => 'fallback-workspace',
            'owner_id' => $user->id,
        ]);
        $workspace->users()->attach($user->id, ['role_id' => $devRole->id]);

        // When no active_workspace_id in session, resolves to first enrolled workspace
        $this->assertNull(session('active_workspace_id'));
        $resolved = $user->currentWorkspace();

        $this->assertNotNull($resolved);
        $this->assertSame($workspace->id, $resolved->id);
    }
}
