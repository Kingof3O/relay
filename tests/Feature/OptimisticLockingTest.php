<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\Workspace;
use App\Services\WorkRequestPresenter;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

final class OptimisticLockingTest extends TestCase
{
    use DatabaseTransactions;

    private User $owner;
    private Area $area;
    private Workspace $workspace;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        $this->owner = User::query()->where('username', 'robin')->firstOrFail();
        $this->area = Area::query()->firstOrFail();
        $this->workspace = Workspace::query()->create([
            'name' => 'Relay Test Workspace',
            'slug' => 'relay-test-workspace',
            'owner_id' => $this->owner->id,
        ]);
        $this->workspace->users()->attach($this->owner->id, ['role_id' => $this->owner->role_id]);
    }

    public function test_lock_version_column_defaults_to_one(): void
    {
        $request = WorkRequest::query()->create([
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'title' => 'Optimistic Lock Baseline',
            'description' => 'Original text',
            'requester_id' => $this->owner->id,
        ]);

        $this->assertSame(1, (int) $request->fresh()->lock_version);
    }

    public function test_lock_version_increments_on_description_update(): void
    {
        $request = WorkRequest::query()->create([
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'title' => 'Updating description',
            'description' => 'Initial spec',
            'requester_id' => $this->owner->id,
        ]);

        $this->assertSame(1, (int) $request->fresh()->lock_version);

        $response = $this->actingAs($this->owner)->patchJson(route('requests.update', $request), [
            'description' => 'Updated spec after review',
        ]);

        $response->assertOk();
        $this->assertSame(2, (int) $request->fresh()->lock_version);
        $this->assertSame(2, $response->json('request.lock_version'));
    }

    public function test_rejects_with_409_conflict_when_lock_version_mismatches(): void
    {
        $request = WorkRequest::query()->create([
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'title' => 'Concurrent Edit Simulation',
            'description' => 'Initial copy',
            'lock_version' => 2, // Already at version 2 in DB
            'requester_id' => $this->owner->id,
        ]);

        // Stale client sends lock_version = 1
        $response = $this->actingAs($this->owner)->patchJson(route('requests.update', $request), [
            'description' => 'Stale editor overwrite',
            'lock_version' => 1,
        ]);

        $response->assertStatus(409);
        $response->assertJsonFragment([
            'message' => 'This request has been updated by another teammate.',
        ]);

        // Database description must remain unmodified
        $this->assertSame('Initial copy', $request->fresh()->description);
        $this->assertSame(2, (int) $request->fresh()->lock_version);
    }

    public function test_accepts_and_increments_when_matching_lock_version_is_submitted(): void
    {
        $request = WorkRequest::query()->create([
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'title' => 'Matching lock version',
            'description' => 'Version 2 content',
            'lock_version' => 2,
            'requester_id' => $this->owner->id,
        ]);

        $response = $this->actingAs($this->owner)->patchJson(route('requests.update', $request), [
            'description' => 'Version 3 content',
            'lock_version' => 2,
        ]);

        $response->assertOk();
        $this->assertSame(3, (int) $request->fresh()->lock_version);
        $this->assertSame(3, $response->json('request.lock_version'));
        $this->assertSame('Version 3 content', $request->fresh()->description);
    }

    public function test_lock_version_is_serialized_in_presenter(): void
    {
        $request = WorkRequest::query()->create([
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'title' => 'Presenter Serialization',
            'lock_version' => 5,
            'requester_id' => $this->owner->id,
        ]);

        $presenter = app(WorkRequestPresenter::class);

        $card = $presenter->card($request);
        $this->assertArrayHasKey('lock_version', $card);
        $this->assertSame(5, $card['lock_version']);

        $detail = $presenter->detail($request);
        $this->assertArrayHasKey('lock_version', $detail);
        $this->assertSame(5, $detail['lock_version']);
    }
}
