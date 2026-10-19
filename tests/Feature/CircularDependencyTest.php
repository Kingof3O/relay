<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

final class CircularDependencyTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private User $unauthorizedUser;

    private Workspace $workspace;

    private Area $area;

    protected function setUp(): void
    {
        parent::setUp();

        $ownerRole = Role::query()->firstOrCreate(['name' => 'Owner'], ['description' => 'Owner']);
        $memberRole = Role::query()->firstOrCreate(['name' => 'Member'], ['description' => 'Member']);

        $this->owner = User::query()->create([
            'name' => 'Owner User',
            'username' => 'owner_user',
            'email' => 'owner@relay.test',
            'password' => Hash::make('password'),
            'role_id' => $ownerRole->id,
            'active' => true,
        ]);

        $this->unauthorizedUser = User::query()->create([
            'name' => 'Other User',
            'username' => 'other_user',
            'email' => 'other@relay.test',
            'password' => Hash::make('password'),
            'role_id' => $memberRole->id,
            'active' => true,
        ]);

        $this->workspace = Workspace::query()->create([
            'name' => 'Main Workspace',
            'slug' => 'main-workspace',
            'owner_id' => $this->owner->id,
        ]);
        $this->workspace->users()->attach($this->owner->id, ['role_id' => $ownerRole->id]);

        $this->area = Area::query()->create([
            'name' => 'Backend',
            'slug' => 'backend',
            'workspace_id' => $this->workspace->id,
        ]);
    }

    public function test_direct_circular_dependency_is_rejected(): void
    {
        $ticketA = WorkRequest::query()->create([
            'area_id' => $this->area->id,
            'workspace_id' => $this->workspace->id,
            'title' => 'Ticket A',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        $ticketB = WorkRequest::query()->create([
            'area_id' => $this->area->id,
            'workspace_id' => $this->workspace->id,
            'title' => 'Ticket B',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        // A is blocked by B (B blocks A)
        $this->actingAs($this->owner)
            ->postJson(route('requests.relations.store', $ticketA), [
                'related_id' => $ticketB->id,
                'type' => 'blocks',
            ])->assertOk();

        // Attempting to make A block B (B is blocked by A) should be rejected
        $response = $this->actingAs($this->owner)
            ->postJson(route('requests.relations.store', $ticketB), [
                'related_id' => $ticketA->id,
                'type' => 'blocks',
            ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('Circular dependency detected', $response->json('message'));
    }

    public function test_transitive_multi_hop_circular_dependency_is_rejected(): void
    {
        $ticketA = WorkRequest::query()->create([
            'area_id' => $this->area->id,
            'workspace_id' => $this->workspace->id,
            'title' => 'Ticket A',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        $ticketB = WorkRequest::query()->create([
            'area_id' => $this->area->id,
            'workspace_id' => $this->workspace->id,
            'title' => 'Ticket B',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        $ticketC = WorkRequest::query()->create([
            'area_id' => $this->area->id,
            'workspace_id' => $this->workspace->id,
            'title' => 'Ticket C',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        // Chain: A is blocked by B (B blocks A)
        $this->actingAs($this->owner)
            ->postJson(route('requests.relations.store', $ticketA), [
                'related_id' => $ticketB->id,
                'type' => 'blocks',
            ])->assertOk();

        // Chain: B is blocked by C (C blocks B)
        $this->actingAs($this->owner)
            ->postJson(route('requests.relations.store', $ticketB), [
                'related_id' => $ticketC->id,
                'type' => 'blocks',
            ])->assertOk();

        // Now attempt to make C blocked by A (A blocks C), completing the 3-hop cycle (C -> B -> A -> C)
        $response = $this->actingAs($this->owner)
            ->postJson(route('requests.relations.store', $ticketC), [
                'related_id' => $ticketA->id,
                'type' => 'blocks',
            ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('Circular dependency detected', $response->json('message'));
    }

    public function test_unauthorized_user_cannot_create_or_delete_relations(): void
    {
        $ticketA = WorkRequest::query()->create([
            'area_id' => $this->area->id,
            'workspace_id' => $this->workspace->id,
            'title' => 'Ticket A',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        $ticketB = WorkRequest::query()->create([
            'area_id' => $this->area->id,
            'workspace_id' => $this->workspace->id,
            'title' => 'Ticket B',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        // Unauthorized user (not a member of workspace) cannot store relation
        $response = $this->actingAs($this->unauthorizedUser)
            ->postJson(route('requests.relations.store', $ticketA), [
                'related_id' => $ticketB->id,
                'type' => 'blocks',
            ]);

        $response->assertStatus(403);

        // Owner creates relation
        $storeResponse = $this->actingAs($this->owner)
            ->postJson(route('requests.relations.store', $ticketA), [
                'related_id' => $ticketB->id,
                'type' => 'blocks',
            ]);
        $storeResponse->assertOk();
        $relationId = $storeResponse->json('relation.id');

        // Unauthorized user cannot delete relation
        $deleteResponse = $this->actingAs($this->unauthorizedUser)
            ->deleteJson(route('requests.relations.destroy', ['request' => $ticketA->id, 'relation' => $relationId]));

        $deleteResponse->assertStatus(403);
    }
}
