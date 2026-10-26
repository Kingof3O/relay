<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\Cycle;
use App\Models\RequestActivity;
use App\Models\RequestRelation;
use App\Models\User;
use App\Models\Workspace;
use App\Services\CycleService;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

final class AtlasDesktopDemoTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_artisan_relay_demo_command_seeds_atlas_desktop_workspace(): void
    {
        $this->artisan('relay:demo')
            ->assertSuccessful();

        $workspace = Workspace::query()->where('slug', 'atlas-desktop')->first();
        $this->assertNotNull($workspace);
        $this->assertEquals('Atlas Desktop', $workspace->name);

        // 5 Areas
        $areas = Area::query()->where('workspace_id', $workspace->id)->get();
        $this->assertCount(5, $areas);
        $expectedAreas = [
            'core-runtime',
            'ui-renderer',
            'extension-host',
            'cloud-sync',
            'security-keyring',
        ];
        $this->assertEqualsCanonicalizing($expectedAreas, $areas->pluck('slug')->all());

        // 3 Cycles
        $cycles = Cycle::query()->where('workspace_id', $workspace->id)->orderBy('number')->get();
        $this->assertCount(3, $cycles);
        $this->assertEquals([12, 13, 14], $cycles->pluck('number')->all());

        $cycle12 = $cycles->firstWhere('number', 12);
        $cycle13 = $cycles->firstWhere('number', 13);
        $cycle14 = $cycles->firstWhere('number', 14);

        $this->assertFalse((bool) $cycle12->is_active);
        $this->assertTrue((bool) $cycle13->is_active);
        $this->assertFalse((bool) $cycle14->is_active);

        // Tickets: 25–35 realistic engineering issues
        $ticketsCount = $workspace->requests()->count();
        $this->assertGreaterThanOrEqual(25, $ticketsCount);
        $this->assertLessThanOrEqual(35, $ticketsCount);

        // All story points are valid Fibonacci numbers
        $validFibonacci = [1, 2, 3, 5, 8];
        $workspace->requests()->each(function ($ticket) use ($validFibonacci): void {
            if ($ticket->story_points !== null) {
                $this->assertContains($ticket->story_points, $validFibonacci);
            }
        });

        // Cycle 12 has 100% burndown
        $cycleService = app(CycleService::class);
        $c12Burndown = $cycleService->getBurndown($cycle12);
        $this->assertEquals(100, $c12Burndown['metrics']['completion_percentage']);
        $this->assertEquals(0, $c12Burndown['metrics']['remaining_points']);

        // Cycle 13 has mid burndown
        $c13Burndown = $cycleService->getBurndown($cycle13);
        $this->assertGreaterThan(0, $c13Burndown['metrics']['completed_points']);
        $this->assertGreaterThan(0, $c13Burndown['metrics']['remaining_points']);

        // Relations & subtasks exist
        $this->assertTrue(RequestRelation::query()->where('type', 'blocks')->exists());
        $this->assertTrue($workspace->requests()->whereNotNull('parent_id')->exists());

        // Comments & AI Agent notes exist
        $this->assertTrue(RequestActivity::query()->where('type', 'agent_action')->exists());
    }

    public function test_seed_demo_via_http_endpoint(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();

        $response = $this->actingAs($user)
            ->post(route('workspaces.seed-demo'));

        $response->assertRedirect(route('dashboard'));

        $workspace = Workspace::query()->where('slug', 'atlas-desktop')->first();
        $this->assertNotNull($workspace);
        $this->assertEquals($workspace->id, session('active_workspace_id'));
    }
}
