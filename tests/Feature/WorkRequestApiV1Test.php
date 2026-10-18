<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class WorkRequestApiV1Test extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;
    private Area $area;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        $this->user = User::query()->where('username', 'robin')->firstOrFail();
        $this->token = $this->user->createToken('test-api-token')->plainTextToken;
        $this->area = Area::query()->firstOrFail();
    }

    public function test_api_endpoints_require_authentication(): void
    {
        $this->getJson('/api/v1/work-requests')->assertUnauthorized();
        $this->postJson('/api/v1/work-requests', [])->assertUnauthorized();
        $this->getJson('/api/v1/projects')->assertUnauthorized();
    }

    public function test_listing_work_requests_with_sanctum_token(): void
    {
        for ($i = 1; $i <= 3; $i++) {
            WorkRequest::query()->create([
                'title' => "Test Ticket {$i}",
                'area_id' => $this->area->id,
                'requester_id' => $this->user->id,
                'status' => 'new',
                'priority' => 'normal',
            ]);
        }

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/work-requests');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'status',
                        'priority',
                        'area',
                        'created_at',
                    ],
                ],
                'links',
                'meta',
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_filtering_work_requests_by_status_priority_and_area(): void
    {
        $otherArea = Area::query()->create([
            'name' => 'Secondary Area',
            'slug' => 'secondary-area',
            'color' => '#10B981',
            'sort_order' => 10,
        ]);

        $req1 = WorkRequest::query()->create([
            'title' => 'Urgent Ticket',
            'area_id' => $this->area->id,
            'status' => 'doing',
            'priority' => 'urgent',
            'requester_id' => $this->user->id,
        ]);

        $req2 = WorkRequest::query()->create([
            'title' => 'Low Priority Ticket',
            'area_id' => $otherArea->id,
            'status' => 'ready',
            'priority' => 'low',
            'requester_id' => $this->user->id,
        ]);

        // Filter by status
        $resStatus = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/work-requests?status=doing');
        $resStatus->assertOk();
        $this->assertCount(1, $resStatus->json('data'));
        $this->assertEquals($req1->id, $resStatus->json('data.0.id'));

        // Filter by priority
        $resPriority = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/work-requests?priority=urgent');
        $resPriority->assertOk();
        $this->assertCount(1, $resPriority->json('data'));
        $this->assertEquals($req1->id, $resPriority->json('data.0.id'));

        // Filter by area_id
        $resArea = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/work-requests?area_id=' . $otherArea->id);
        $resArea->assertOk();
        $this->assertCount(1, $resArea->json('data'));
        $this->assertEquals($req2->id, $resArea->json('data.0.id'));
    }

    public function test_creating_work_request_validates_required_fields(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/work-requests', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'area_id']);
    }

    public function test_creating_work_request_successfully_returns_201(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/work-requests', [
                'title' => 'Integrate REST API v1',
                'description' => 'Document and test public API v1 endpoints.',
                'area_id' => $this->area->id,
                'priority' => 'urgent',
                'story_points' => 5,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Integrate REST API v1')
            ->assertJsonPath('data.priority', 'urgent')
            ->assertJsonPath('data.story_points', 5)
            ->assertJsonPath('data.area_id', $this->area->id);

        $this->assertDatabaseHas('requests', [
            'title' => 'Integrate REST API v1',
            'area_id' => $this->area->id,
            'priority' => 'urgent',
            'story_points' => 5,
        ]);
    }

    public function test_showing_single_work_request_with_relations_and_subtasks(): void
    {
        $parent = WorkRequest::query()->create([
            'area_id' => $this->area->id,
            'title' => 'Parent Ticket',
            'requester_id' => $this->user->id,
            'status' => 'new',
            'priority' => 'normal',
        ]);

        $subtask = WorkRequest::query()->create([
            'parent_id' => $parent->id,
            'area_id' => $this->area->id,
            'title' => 'Child Subtask Ticket',
            'requester_id' => $this->user->id,
            'status' => 'new',
            'priority' => 'normal',
        ]);

        $relatedTicket = WorkRequest::query()->create([
            'area_id' => $this->area->id,
            'title' => 'Related Blocker Ticket',
            'requester_id' => $this->user->id,
            'status' => 'doing',
            'priority' => 'urgent',
        ]);

        \App\Models\RequestRelation::query()->create([
            'request_id' => $parent->id,
            'related_id' => $relatedTicket->id,
            'type' => 'blocks',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson("/api/v1/work-requests/{$parent->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $parent->id)
            ->assertJsonPath('data.title', 'Parent Ticket')
            ->assertJsonCount(1, 'data.subtasks')
            ->assertJsonPath('data.subtasks.0.id', $subtask->id)
            ->assertJsonPath('data.subtasks.0.title', 'Child Subtask Ticket')
            ->assertJsonCount(1, 'data.relations')
            ->assertJsonPath('data.relations.0.type', 'blocks')
            ->assertJsonPath('data.relations.0.related_id', $relatedTicket->id)
            ->assertJsonPath('data.relations.0.related.title', 'Related Blocker Ticket');
    }

    public function test_creating_work_request_rejects_invalid_priority(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/work-requests', [
                'title' => 'Invalid Priority Ticket',
                'area_id' => $this->area->id,
                'priority' => 'high', // not an allowed RequestPriority enum value (urgent, normal, low)
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['priority']);
    }

    public function test_updating_work_request_via_patch(): void
    {
        $ticket = WorkRequest::query()->create([
            'area_id' => $this->area->id,
            'title' => 'Original Title',
            'status' => 'new',
            'priority' => 'normal',
            'requester_id' => $this->user->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->patchJson("/api/v1/work-requests/{$ticket->id}", [
                'title' => 'Updated Title via API',
                'status' => 'doing',
                'priority' => 'urgent',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.title', 'Updated Title via API')
            ->assertJsonPath('data.status', 'doing')
            ->assertJsonPath('data.priority', 'urgent');

        $this->assertDatabaseHas('requests', [
            'id' => $ticket->id,
            'title' => 'Updated Title via API',
            'status' => 'doing',
            'priority' => 'urgent',
        ]);
    }

    public function test_deleting_work_request_soft_deletes(): void
    {
        $ticket = WorkRequest::query()->create([
            'area_id' => $this->area->id,
            'title' => 'Ticket to Delete',
            'requester_id' => $this->user->id,
            'status' => 'new',
            'priority' => 'normal',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->deleteJson("/api/v1/work-requests/{$ticket->id}");

        $response->assertOk()
            ->assertJsonPath('deleted', true);

        $this->assertSoftDeleted('requests', ['id' => $ticket->id]);
    }

    public function test_listing_active_projects(): void
    {
        Area::query()->create([
            'name' => 'Archived Initiative',
            'slug' => 'archived-initiative',
            'color' => '#8B5CF6',
            'sort_order' => 99,
            'archived_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/projects');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'color',
                        'sort_order',
                    ],
                ],
            ]);

        $names = collect($response->json('data'))->pluck('name');
        $this->assertFalse($names->contains('Archived Initiative'));
    }
}
