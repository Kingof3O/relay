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

final class StoryPointsTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_story_points_storage_and_casting(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Fibonacci estimation test',
            'requester_id' => $owner->id,
            'story_points' => 8,
        ]);

        $this->assertDatabaseHas('requests', [
            'id' => $request->id,
            'story_points' => 8,
        ]);

        $this->assertSame(8, $request->fresh()->story_points);

        $request->update(['story_points' => 13]);
        $this->assertSame(13, $request->fresh()->story_points);

        $request->update(['story_points' => null]);
        $this->assertNull($request->fresh()->story_points);
    }

    public function test_story_points_validation(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Validation test',
            'requester_id' => $owner->id,
        ]);

        // Valid points
        $response = $this->actingAs($owner)->patchJson(route('requests.update', $request), [
            'story_points' => 5,
        ]);
        $response->assertOk();
        $this->assertSame(5, $request->fresh()->story_points);

        // Invalid negative points
        $invalidResponse = $this->actingAs($owner)->patchJson(route('requests.update', $request), [
            'story_points' => -5,
        ]);
        $invalidResponse->assertUnprocessable();
        $invalidResponse->assertJsonValidationErrors(['story_points']);

        // Invalid non-integer
        $stringResponse = $this->actingAs($owner)->patchJson(route('requests.update', $request), [
            'story_points' => 'large',
        ]);
        $stringResponse->assertUnprocessable();
        $stringResponse->assertJsonValidationErrors(['story_points']);

        // Exceeding max points
        $overflowResponse = $this->actingAs($owner)->patchJson(route('requests.update', $request), [
            'story_points' => 200,
        ]);
        $overflowResponse->assertUnprocessable();
        $overflowResponse->assertJsonValidationErrors(['story_points']);
    }

    public function test_story_points_in_work_request_presenter_output(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();
        $presenter = app(WorkRequestPresenter::class);

        $estimated = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Estimated Task',
            'requester_id' => $owner->id,
            'story_points' => 5,
        ]);

        $card = $presenter->card($estimated);
        $this->assertArrayHasKey('story_points', $card);
        $this->assertSame(5, $card['story_points']);

        $detail = $presenter->detail($estimated);
        $this->assertArrayHasKey('story_points', $detail);
        $this->assertSame(5, $detail['story_points']);

        $unestimated = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Unestimated Task',
            'requester_id' => $owner->id,
            'story_points' => null,
        ]);

        $unestimatedCard = $presenter->card($unestimated);
        $this->assertNull($unestimatedCard['story_points']);
    }

    public function test_updating_story_points_via_http_api(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'T-Shirt sizing test',
            'requester_id' => $owner->id,
            'story_points' => 1, // XS
        ]);

        $response = $this->actingAs($owner)->patchJson(route('requests.update', $request), [
            'story_points' => 8, // XL
        ]);

        $response->assertOk();
        $this->assertEquals(8, $response->json('request.story_points'));
        $this->assertSame(8, $request->fresh()->story_points);
    }
}
