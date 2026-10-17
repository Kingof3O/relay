<?php

namespace Tests\Feature;

use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use App\Services\WorkRequestPresenter;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

final class WorkRequestAttributesTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_due_date_serialization_and_overdue_flag(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();
        $presenter = app(WorkRequestPresenter::class);

        // Future due date
        $futureRequest = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Future deadline task',
            'requester_id' => $owner->id,
            'status' => 'new',
            'due_date' => now()->addDays(5)->toDateString(),
        ]);

        $futureCard = $presenter->card($futureRequest);
        $this->assertEquals($futureRequest->due_date->format('Y-m-d'), $futureCard['due_date']);
        $this->assertFalse($futureCard['is_overdue']);
        $this->assertEquals('Due in 5d', $futureCard['due_human']);

        // Past due date (overdue)
        $pastRequest = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Overdue task',
            'requester_id' => $owner->id,
            'status' => 'doing',
            'due_date' => now()->subDays(2)->toDateString(),
        ]);

        $pastCard = $presenter->card($pastRequest);
        $this->assertTrue($pastCard['is_overdue']);
        $this->assertEquals('Overdue by 2d', $pastCard['due_human']);

        // Past due date but status is 'done' -> not overdue
        $pastRequest->update(['status' => 'done']);
        $doneCard = $presenter->card($pastRequest->fresh());
        $this->assertFalse($doneCard['is_overdue']);
    }

    public function test_soft_delete_and_restore(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Delete and restore test',
            'requester_id' => $owner->id,
        ]);

        $requestId = $request->id;

        // Soft delete
        $request->delete();
        $this->assertTrue($request->trashed());
        $this->assertNull(WorkRequest::query()->find($requestId));
        $this->assertNotNull(WorkRequest::withTrashed()->find($requestId));

        // Restore
        $request->restore();
        $this->assertFalse($request->trashed());
        $this->assertNotNull(WorkRequest::query()->find($requestId));
    }

    public function test_storing_and_presenting_tags_array(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();
        $presenter = app(WorkRequestPresenter::class);

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Tagged task',
            'requester_id' => $owner->id,
            'tags' => ['frontend', 'bug', 'high-priority'],
        ]);

        $this->assertIsArray($request->fresh()->tags);
        $this->assertEquals(['frontend', 'bug', 'high-priority'], $request->fresh()->tags);

        $card = $presenter->card($request->fresh());
        $this->assertEquals(['frontend', 'bug', 'high-priority'], $card['tags']);
    }

    public function test_updating_due_date_and_tags_via_http(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'HTTP update test',
            'requester_id' => $owner->id,
        ]);

        $dueDate = now()->addDays(3)->toDateString();

        $response = $this->actingAs($owner)->patchJson(route('requests.update', $request), [
            'due_date' => $dueDate,
            'tags' => ['api', 'security'],
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('requests', [
            'id' => $request->id,
            'due_date' => $dueDate,
        ]);

        $fresh = $request->fresh();
        $this->assertEquals(['api', 'security'], $fresh->tags);
    }
}
