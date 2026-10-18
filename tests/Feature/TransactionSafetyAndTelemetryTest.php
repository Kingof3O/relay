<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\SendRequestEmail;
use App\Models\Area;
use App\Models\RequestActivity;
use App\Models\User;
use App\Models\WorkRequest;
use App\Services\DashboardService;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

final class TransactionSafetyAndTelemetryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_email_dispatch_is_deferred_until_transaction_commits(): void
    {
        Queue::fake();

        $author = User::query()->where('username', 'robin')->firstOrFail();
        $mentioned = User::query()->where('username', 'hussien')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Test Transaction Ticket',
            'description' => 'Testing afterCommit behavior',
            'status' => 'new',
            'priority' => 'normal',
            'requester_id' => $author->id,
        ]);

        // Scenario 1: Inside transaction that rolls back -> no email dispatched
        try {
            DB::transaction(function () use ($author, $mentioned, $request): void {
                $this->actingAs($author)->postJson(route('requests.comments.store', $request->id), [
                    'body' => "Hey @{$mentioned->username}, please do not commit this!",
                ]);

                throw new \RuntimeException('Simulated rollback');
            });
        } catch (\RuntimeException) {
            // expected
        }

        Queue::assertNotPushed(SendRequestEmail::class);

        // Scenario 2: Normal request execution -> email is dispatched
        $response = $this->actingAs($author)->postJson(route('requests.comments.store', $request->id), [
            'body' => "Hey @{$mentioned->username}, this should commit cleanly!",
        ]);

        $response->assertOk();

        Queue::assertPushed(SendRequestEmail::class, function (SendRequestEmail $job) use ($mentioned, $request): bool {
            return $job->userId === $mentioned->id
                && $job->payload['event'] === 'mention'
                && $job->payload['request_id'] === $request->id;
        });
    }

    public function test_dashboard_velocity_returns_exact_counts_without_synthetic_random_data(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $service = app(DashboardService::class);

        // When no requests exist in the past 7 days, all counts must be strictly 0
        $data = $service->build($user);
        $this->assertArrayHasKey('velocity', $data);
        $this->assertCount(7, $data['velocity']);

        foreach ($data['velocity'] as $dayStat) {
            $this->assertSame(0, $dayStat['created'], "Created count should be exactly 0, got {$dayStat['created']}");
            $this->assertSame(0, $dayStat['completed'], "Completed count should be exactly 0, got {$dayStat['completed']}");
        }

        // Now create 3 requests today
        $now = now();
        for ($i = 0; $i < 3; $i++) {
            $req = WorkRequest::query()->create([
                'area_id' => $area->id,
                'title' => "Velocity request {$i}",
                'description' => 'Test',
                'status' => 'new',
                'priority' => 'normal',
                'requester_id' => $user->id,
                'created_at' => $now,
            ]);

            // Add activity: 2 marked done with metadata->to = 'done'
            if ($i < 2) {
                RequestActivity::query()->create([
                    'request_id' => $req->id,
                    'user_id' => $user->id,
                    'type' => 'status_changed',
                    'body' => 'Marked as completed', // note body doesn't contain word "done"
                    'metadata' => ['from' => 'new', 'to' => 'done'],
                    'created_at' => $now,
                ]);
            }
        }

        // Add an activity that has body 'done' but metadata->to is 'review' - should NOT count as completed!
        RequestActivity::query()->create([
            'request_id' => WorkRequest::query()->first()->id,
            'user_id' => $user->id,
            'type' => 'status_changed',
            'body' => 'We are not done yet',
            'metadata' => ['from' => 'ready', 'to' => 'review'],
            'created_at' => $now,
        ]);

        $freshData = $service->build($user);
        $todayStat = collect($freshData['velocity'])->firstWhere('date', $now->format('M j'));

        $this->assertNotNull($todayStat);
        $this->assertSame(3, $todayStat['created'], 'Should record exactly 3 created requests');
        $this->assertSame(2, $todayStat['completed'], 'Should record exactly 2 completed requests based on metadata->to');
    }
}
