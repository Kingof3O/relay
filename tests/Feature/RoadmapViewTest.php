<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\RequestRelation;
use App\Models\User;
use App\Models\WorkRequest;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

final class RoadmapViewTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_roadmap_view_renders_with_inertia(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();

        $response = $this->actingAs($owner)->get(route('roadmap.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Roadmap/Index')
            ->has('projects')
            ->has('requests')
            ->has('year')
            ->has('quarter')
            ->has('quarter_start')
            ->has('quarter_end')
        );
    }

    public function test_roadmap_quarterly_date_ranges_calculation(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();

        $response = $this->actingAs($owner)->getJson(route('roadmap.index', [
            'year' => 2026,
            'quarter' => 2,
        ]));

        $response->assertOk();
        $this->assertEquals(2026, $response->json('year'));
        $this->assertEquals(2, $response->json('quarter'));
        $this->assertEquals('2026-04-01', $response->json('quarter_start'));
        $this->assertEquals('2026-06-30', $response->json('quarter_end'));
    }

    public function test_roadmap_json_data_serialization(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $blocker = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Blocker Issue',
            'requester_id' => $owner->id,
            'status' => 'doing',
            'priority' => 'urgent',
            'due_date' => now()->addDays(10)->toDateString(),
            'story_points' => 5,
        ]);

        $blocked = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Blocked Dependent Issue',
            'requester_id' => $owner->id,
            'status' => 'new',
            'priority' => 'normal',
            'due_date' => now()->addDays(20)->toDateString(),
            'story_points' => 8,
            'is_blocked' => true,
        ]);

        RequestRelation::query()->create([
            'request_id' => $blocked->id,
            'related_id' => $blocker->id,
            'type' => 'blocks',
        ]);

        $response = $this->actingAs($owner)->getJson(route('roadmap.index'));

        $response->assertOk();
        $requests = collect($response->json('requests'));

        $serializedBlocker = $requests->firstWhere('id', $blocker->id);
        $this->assertNotNull($serializedBlocker);
        $this->assertEquals('Blocker Issue', $serializedBlocker['title']);
        $this->assertEquals('urgent', $serializedBlocker['priority']);
        $this->assertEquals(5, $serializedBlocker['story_points']);

        $serializedBlocked = $requests->firstWhere('id', $blocked->id);
        $this->assertNotNull($serializedBlocked);
        $this->assertTrue($serializedBlocked['is_blocked']);
        $this->assertContains($blocker->id, $serializedBlocked['blocking_ids']);

        $projects = collect($response->json('projects'));
        $serializedProject = $projects->firstWhere('id', $area->id);
        $this->assertNotNull($serializedProject);
        $this->assertGreaterThanOrEqual(2, $serializedProject['total_requests']);
    }

    public function test_roadmap_quarter_parameter_clamping(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();

        // Quarter > 4 clamped to 4
        $respHigh = $this->actingAs($owner)->getJson(route('roadmap.index', ['quarter' => 99]));
        $this->assertEquals(4, $respHigh->json('quarter'));

        // Quarter < 1 clamped to 1
        $respLow = $this->actingAs($owner)->getJson(route('roadmap.index', ['quarter' => -3]));
        $this->assertEquals(1, $respLow->json('quarter'));
    }
}
