<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use App\Services\WorkRequestPresenter;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

final class SubtasksHierarchyTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_parent_child_hierarchical_relation(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $parent = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Parent Epic Ticket',
            'requester_id' => $owner->id,
            'status' => 'doing',
        ]);

        $subtask1 = WorkRequest::query()->create([
            'area_id' => $area->id,
            'parent_id' => $parent->id,
            'title' => 'Subtask 1: Migration',
            'requester_id' => $owner->id,
            'status' => 'done',
        ]);

        $subtask2 = WorkRequest::query()->create([
            'area_id' => $area->id,
            'parent_id' => $parent->id,
            'title' => 'Subtask 2: UI implementation',
            'requester_id' => $owner->id,
            'status' => 'new',
        ]);

        $this->assertCount(2, $parent->fresh()->subtasks);
        $this->assertEquals($parent->id, $subtask1->fresh()->parent->id);
        $this->assertEquals($parent->id, $subtask2->fresh()->parent->id);

        // Verify cascade deletion
        $subtaskId1 = $subtask1->id;
        $subtaskId2 = $subtask2->id;
        $parent->forceDelete();

        $this->assertDatabaseMissing('requests', ['id' => $subtaskId1]);
        $this->assertDatabaseMissing('requests', ['id' => $subtaskId2]);
    }

    public function test_subtasks_progress_calculation_in_presenter(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();
        $presenter = app(WorkRequestPresenter::class);

        $parent = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Parent Feature',
            'requester_id' => $owner->id,
        ]);

        // Create 5 subtasks, 3 completed
        for ($i = 1; $i <= 5; $i++) {
            WorkRequest::query()->create([
                'area_id' => $area->id,
                'parent_id' => $parent->id,
                'title' => "Subtask {$i}",
                'requester_id' => $owner->id,
                'status' => $i <= 3 ? 'done' : 'doing',
            ]);
        }

        $card = $presenter->card($parent->fresh());
        $this->assertNotNull($card['subtasks_progress']);
        $this->assertSame(5, $card['subtasks_progress']['total']);
        $this->assertSame(3, $card['subtasks_progress']['completed']);
        $this->assertSame(60, $card['subtasks_progress']['percentage']);

        $detail = $presenter->detail($parent->fresh());
        $this->assertSame(5, $detail['subtasks_progress']['total']);
        $this->assertSame(3, $detail['subtasks_progress']['completed']);
        $this->assertSame(60, $detail['subtasks_progress']['percentage']);
        $this->assertCount(5, $detail['subtasks']);
    }

    public function test_creating_subtask_via_http_endpoint(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $parent = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Main issue',
            'requester_id' => $owner->id,
        ]);

        $response = $this->actingAs($owner)->postJson(route('requests.subtasks.store', $parent), [
            'title' => 'New inline subtask item',
            'story_points' => 3,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('subtask.title', 'New inline subtask item');
        $response->assertJsonPath('request.subtasks_progress.total', 1);

        $this->assertDatabaseHas('requests', [
            'parent_id' => $parent->id,
            'title' => 'New inline subtask item',
            'story_points' => 3,
        ]);
    }

    public function test_toggling_subtask_status(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $parent = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Parent issue with checklist',
            'requester_id' => $owner->id,
        ]);

        $subtask = WorkRequest::query()->create([
            'area_id' => $area->id,
            'parent_id' => $parent->id,
            'title' => 'Toggle checklist item',
            'requester_id' => $owner->id,
            'status' => 'new',
        ]);

        // Toggle from new -> done
        $toggleDone = $this->actingAs($owner)->postJson(
            route('requests.subtasks.toggle', [$parent, $subtask])
        );
        $toggleDone->assertOk();
        $this->assertEquals('done', $subtask->fresh()->status->value);
        $this->assertEquals(1, $toggleDone->json('request.subtasks_progress.completed'));

        // Toggle from done -> ready (incomplete)
        $toggleIncomplete = $this->actingAs($owner)->postJson(
            route('requests.subtasks.toggle', [$parent, $subtask])
        );
        $toggleIncomplete->assertOk();
        $this->assertEquals('ready', $subtask->fresh()->status->value);
        $this->assertEquals(0, $toggleIncomplete->json('request.subtasks_progress.completed'));
    }
}
