<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class DatabasePortabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_zero_field_syntax_in_production_codebase(): void
    {
        $directories = [
            app_path(),
            database_path(),
            base_path('routes'),
        ];

        $matches = [];

        foreach ($directories as $dir) {
            $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dir));
            /** @var \SplFileInfo $file */
            foreach ($iterator as $file) {
                if ($file->isDir() || $file->getExtension() !== 'php') {
                    continue;
                }

                $content = file_get_contents($file->getPathname());
                if ($content !== false && stripos($content, 'FIELD(') !== false) {
                    $matches[] = $file->getPathname();
                }
            }
        }

        $this->assertEmpty($matches, 'Found MySQL-specific FIELD() syntax in: '.implode(', ', $matches));
    }

    public function test_ansi_sql_case_ordering_orders_by_priority_properly(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        // Create low, normal, and urgent requests in reverse order with same timestamps
        $low = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Low priority task',
            'description' => 'Desc',
            'status' => 'new',
            'priority' => 'low',
            'requester_id' => $user->id,
            'is_blocked' => false,
            'updated_at' => now(),
            'created_at' => now(),
        ]);

        $normal = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Normal priority task',
            'description' => 'Desc',
            'status' => 'new',
            'priority' => 'normal',
            'requester_id' => $user->id,
            'is_blocked' => false,
            'updated_at' => now(),
            'created_at' => now(),
        ]);

        $urgent = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Urgent priority task',
            'description' => 'Desc',
            'status' => 'new',
            'priority' => 'urgent',
            'requester_id' => $user->id,
            'is_blocked' => false,
            'updated_at' => now(),
            'created_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('requests.index'));
        $response->assertOk();

        $pageRequests = $response->viewData('page')['props']['requests'];
        $requestIds = array_column($pageRequests, 'id');

        $urgentIndex = array_search($urgent->id, $requestIds, true);
        $normalIndex = array_search($normal->id, $requestIds, true);
        $lowIndex = array_search($low->id, $requestIds, true);

        $this->assertNotFalse($urgentIndex, 'Urgent request not found in response');
        $this->assertNotFalse($normalIndex, 'Normal request not found in response');
        $this->assertNotFalse($lowIndex, 'Low request not found in response');

        $this->assertLessThan($normalIndex, $urgentIndex, 'Urgent should appear before Normal');
        $this->assertLessThan($lowIndex, $normalIndex, 'Normal should appear before Low');
    }

    public function test_work_request_scopes_execute_without_syntax_errors(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Due soon task',
            'description' => 'Scope test',
            'status' => 'doing',
            'priority' => 'normal',
            'requester_id' => $user->id,
            'assignee_id' => $user->id,
            'due_date' => now()->addDays(2)->toDateString(),
            'is_blocked' => false,
        ]);

        WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Overdue task',
            'description' => 'Scope test 2',
            'status' => 'ready',
            'priority' => 'urgent',
            'requester_id' => $user->id,
            'assignee_id' => $user->id,
            'due_date' => now()->subDays(2)->toDateString(),
            'is_blocked' => true,
        ]);

        $dueSoon = WorkRequest::query()->dueSoon()->get();
        $this->assertCount(1, $dueSoon);
        $this->assertSame('Due soon task', $dueSoon->first()->title);

        $overdue = WorkRequest::query()->overdue()->get();
        $this->assertCount(1, $overdue);
        $this->assertSame('Overdue task', $overdue->first()->title);

        $filteredBlocked = WorkRequest::query()->filter(['is_blocked' => 1])->get();
        $this->assertCount(1, $filteredBlocked);
        $this->assertSame('Overdue task', $filteredBlocked->first()->title);

        $filteredMyWork = WorkRequest::query()->filter(['my_work' => 1], $user)->get();
        $this->assertCount(2, $filteredMyWork);
    }
}
