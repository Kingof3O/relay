<?php

namespace Tests\Feature;

use App\Models\Area;
use App\Models\RequestRelation;
use App\Models\User;
use App\Models\WorkRequest;
use App\Services\WorkRequestService;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

final class RequestDependenciesTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_linking_blocking_ticket_sets_is_blocked_to_true(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $ticketA = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Blocker Ticket A',
            'requester_id' => $owner->id,
            'status' => 'doing',
        ]);

        $ticketB = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Dependent Ticket B',
            'requester_id' => $owner->id,
            'status' => 'new',
            'is_blocked' => false,
        ]);

        // Link Ticket A as blocker of Ticket B
        $response = $this->actingAs($owner)->postJson(route('requests.relations.store', $ticketB), [
            'related_id' => $ticketA->id,
            'type' => 'blocks',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('request_relations', [
            'request_id' => $ticketB->id,
            'related_id' => $ticketA->id,
            'type' => 'blocks',
        ]);

        $ticketB->refresh();
        $this->assertTrue($ticketB->is_blocked);
        $this->assertStringContainsString("Blocked by #REQ-{$ticketA->id}", $ticketB->blocked_reason);
    }

    public function test_marking_blocker_as_done_auto_unblocks_dependent_ticket(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();
        $service = app(WorkRequestService::class);

        $blocker = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Core DB Migration Blocker',
            'requester_id' => $owner->id,
            'status' => 'doing',
        ]);

        $dependent = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Dependent Feature Implementation',
            'requester_id' => $owner->id,
            'status' => 'new',
            'is_blocked' => true,
            'blocked_reason' => "Waiting for #REQ-{$blocker->id}",
        ]);

        RequestRelation::query()->create([
            'request_id' => $dependent->id,
            'related_id' => $blocker->id,
            'type' => 'blocks',
        ]);

        // Mark blocker as done via service/update
        $service->update($blocker, $owner, ['status' => 'done']);

        $dependent->refresh();
        $this->assertFalse($dependent->is_blocked);

        // Verify unblocked activity was recorded
        $this->assertDatabaseHas('request_activities', [
            'request_id' => $dependent->id,
            'type' => 'unblocked',
            'body' => "Unblocked: Dependency #REQ-{$blocker->id} completed.",
        ]);
    }

    public function test_unlinking_blocker_removes_blocked_status(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $blocker = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Temporary Blocker',
            'requester_id' => $owner->id,
            'status' => 'doing',
        ]);

        $dependent = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Waiting Ticket',
            'requester_id' => $owner->id,
            'status' => 'new',
            'is_blocked' => true,
        ]);

        $relation = RequestRelation::query()->create([
            'request_id' => $dependent->id,
            'related_id' => $blocker->id,
            'type' => 'blocks',
        ]);

        $response = $this->actingAs($owner)->deleteJson(
            route('requests.relations.destroy', ['request' => $dependent->id, 'relation' => $relation->id])
        );

        $response->assertOk();
        $this->assertDatabaseMissing('request_relations', ['id' => $relation->id]);

        $dependent->refresh();
        $this->assertFalse($dependent->is_blocked);
    }
}
