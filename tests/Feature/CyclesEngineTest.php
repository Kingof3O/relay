<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\Cycle;
use App\Models\User;
use App\Models\WorkRequest;
use App\Services\CycleService;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

final class CyclesEngineTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_cycle_creation_and_activation_scope(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $workspace = $owner->currentWorkspace();
        $area = Area::query()->firstOrFail();

        $activeCycle = Cycle::query()->create([
            'workspace_id' => $workspace?->id,
            'number' => 1,
            'name' => 'Cycle 1',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(13)->toDateString(),
            'is_active' => true,
        ]);

        $upcomingCycle = Cycle::query()->create([
            'workspace_id' => $workspace?->id,
            'number' => 2,
            'name' => 'Cycle 2',
            'start_date' => now()->addDays(14)->toDateString(),
            'end_date' => now()->addDays(27)->toDateString(),
            'is_active' => false,
        ]);

        $this->assertEquals($activeCycle->id, Cycle::query()->active()->first()?->id);
        $this->assertEquals($upcomingCycle->id, Cycle::query()->upcoming()->first()?->id);

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'cycle_id' => $activeCycle->id,
            'title' => 'Sprint ticket',
            'requester_id' => $owner->id,
        ]);

        $this->assertEquals($activeCycle->id, $request->fresh()->cycle->id);
        $this->assertCount(1, $activeCycle->requests);
    }

    public function test_burndown_velocity_calculation(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();
        $service = app(CycleService::class);

        $cycle = Cycle::query()->create([
            'number' => 10,
            'name' => 'Cycle 10',
            'start_date' => now()->subDays(6)->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
            'is_active' => true,
        ]);

        // Create 3 tickets with story points: 5, 8, 3 = 16 total
        $ticket1 = WorkRequest::query()->create([
            'area_id' => $area->id,
            'cycle_id' => $cycle->id,
            'title' => 'Completed task',
            'requester_id' => $owner->id,
            'status' => 'done',
            'story_points' => 5,
        ]);

        $ticket2 = WorkRequest::query()->create([
            'area_id' => $area->id,
            'cycle_id' => $cycle->id,
            'title' => 'In progress task',
            'requester_id' => $owner->id,
            'status' => 'doing',
            'story_points' => 8,
        ]);

        $ticket3 = WorkRequest::query()->create([
            'area_id' => $area->id,
            'cycle_id' => $cycle->id,
            'title' => 'Backlog task',
            'requester_id' => $owner->id,
            'status' => 'new',
            'story_points' => 3,
        ]);

        $burndown = $service->getBurndown($cycle);

        $this->assertEquals(16, $burndown['metrics']['total_points']);
        $this->assertEquals(5, $burndown['metrics']['completed_points']);
        $this->assertEquals(11, $burndown['metrics']['remaining_points']);
        $this->assertEquals(3, $burndown['metrics']['total_tickets']);
        $this->assertEquals(1, $burndown['metrics']['completed_tickets']);
        $this->assertCount(14, $burndown['days']);
        $this->assertGreaterThan(0, $burndown['metrics']['velocity_points_per_day']);
    }

    public function test_rollover_command_closes_expired_cycle_and_rolls_over_unfinished_tickets(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        // Expired active cycle
        $cycle = Cycle::query()->create([
            'number' => 1,
            'name' => 'Sprint 1',
            'start_date' => now()->subDays(15)->toDateString(),
            'end_date' => now()->subDay()->toDateString(),
            'is_active' => true,
        ]);

        $doneTicket = WorkRequest::query()->create([
            'area_id' => $area->id,
            'cycle_id' => $cycle->id,
            'title' => 'Done ticket',
            'requester_id' => $owner->id,
            'status' => 'done',
            'story_points' => 5,
        ]);

        $unfinishedTicket = WorkRequest::query()->create([
            'area_id' => $area->id,
            'cycle_id' => $cycle->id,
            'title' => 'Unfinished ticket',
            'requester_id' => $owner->id,
            'status' => 'doing',
            'story_points' => 8,
        ]);

        $this->artisan('relay:cycle-rollover')
            ->expectsOutputToContain('Cycle #1 closed. Cycle #2 created.')
            ->assertSuccessful();

        $cycle->refresh();
        $this->assertFalse($cycle->is_active);
        $this->assertNotNull($cycle->completed_at);

        $newCycle = Cycle::query()->where('number', 2)->firstOrFail();
        $this->assertTrue($newCycle->is_active);

        // Done ticket remains in old cycle
        $this->assertEquals($cycle->id, $doneTicket->fresh()->cycle_id);
        $this->assertNull($doneTicket->fresh()->rolled_over_from_cycle_id);

        // Unfinished ticket rolled over to new cycle with indicator
        $this->assertEquals($newCycle->id, $unfinishedTicket->fresh()->cycle_id);
        $this->assertEquals($cycle->id, $unfinishedTicket->fresh()->rolled_over_from_cycle_id);
    }

    public function test_cycle_controller_index_renders_active_cycle_and_tickets(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $cycle = Cycle::query()->create([
            'number' => 1,
            'name' => 'Sprint 1',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(13)->toDateString(),
            'is_active' => true,
        ]);

        WorkRequest::query()->create([
            'area_id' => $area->id,
            'cycle_id' => $cycle->id,
            'title' => 'Active cycle issue',
            'requester_id' => $owner->id,
            'story_points' => 5,
        ]);

        $response = $this->actingAs($owner)->get(route('cycles.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Cycles/Index')
            ->has('currentCycle')
            ->has('burndown')
            ->has('tickets', 1)
            ->where('currentCycle.id', $cycle->id)
        );
    }

    public function test_cycle_rollover_via_http_endpoint(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();

        $cycle = Cycle::query()->create([
            'number' => 3,
            'name' => 'Cycle 3',
            'start_date' => now()->subDays(14)->toDateString(),
            'end_date' => now()->toDateString(),
            'is_active' => true,
        ]);

        $response = $this->actingAs($owner)->post(route('cycles.rollover', $cycle));

        $response->assertRedirect();
        $this->assertFalse($cycle->fresh()->is_active);

        $nextCycle = Cycle::query()->where('number', 4)->firstOrFail();
        $this->assertTrue($nextCycle->is_active);
    }
}
