<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\SavedView;
use App\Models\User;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

final class SavedViewsTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_saved_view_model_and_casts(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $workspace = $owner->currentWorkspace();

        $view = SavedView::query()->create([
            'user_id' => $owner->id,
            'workspace_id' => $workspace?->id,
            'name' => 'High Priority Bugs',
            'icon' => 'flame',
            'filters' => [
                'priority' => 'urgent',
                'status' => 'doing',
            ],
            'is_pinned' => true,
        ]);

        $this->assertDatabaseHas('saved_views', [
            'id' => $view->id,
            'name' => 'High Priority Bugs',
        ]);

        $fresh = $view->fresh();
        $this->assertTrue($fresh->is_pinned);
        $this->assertIsArray($fresh->filters);
        $this->assertEquals('urgent', $fresh->filters['priority']);
        $this->assertEquals($owner->id, $fresh->user->id);
    }

    public function test_listing_saved_views_via_api(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();

        SavedView::query()->create([
            'user_id' => $owner->id,
            'name' => 'My View 1',
            'icon' => 'bookmark',
            'filters' => ['my_work' => 1],
            'is_pinned' => true,
        ]);

        SavedView::query()->create([
            'user_id' => $owner->id,
            'name' => 'My View 2',
            'icon' => 'filter',
            'filters' => ['status' => 'review'],
            'is_pinned' => false,
        ]);

        $response = $this->actingAs($owner)->getJson(route('saved-views.index'));

        $response->assertOk();
        $response->assertJsonCount(2, 'views');
        $this->assertEquals('My View 1', $response->json('views.0.name'));
    }

    public function test_creating_custom_saved_view(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();

        $response = $this->actingAs($owner)->postJson(route('saved-views.store'), [
            'name' => 'Mobile Backend Filter',
            'icon' => 'smartphone',
            'filters' => [
                'project' => 1,
                'priority' => 'urgent',
                'search' => 'crash',
            ],
            'is_pinned' => true,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('saved_view.name', 'Mobile Backend Filter');
        $response->assertJsonPath('saved_view.filters.search', 'crash');

        $this->assertDatabaseHas('saved_views', [
            'user_id' => $owner->id,
            'name' => 'Mobile Backend Filter',
        ]);
    }

    public function test_toggling_pinned_state_of_saved_view(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();

        $view = SavedView::query()->create([
            'user_id' => $owner->id,
            'name' => 'Toggle Pin Test',
            'icon' => 'filter',
            'filters' => [],
            'is_pinned' => true,
        ]);

        // Toggle from true -> false
        $unpinResponse = $this->actingAs($owner)->patchJson(route('saved-views.pin', $view));
        $unpinResponse->assertOk();
        $this->assertFalse($view->fresh()->is_pinned);

        // Toggle from false -> true
        $pinResponse = $this->actingAs($owner)->patchJson(route('saved-views.pin', $view));
        $pinResponse->assertOk();
        $this->assertTrue($view->fresh()->is_pinned);
    }

    public function test_deleting_saved_view(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();

        $view = SavedView::query()->create([
            'user_id' => $owner->id,
            'name' => 'Delete Me',
            'icon' => 'filter',
            'filters' => [],
        ]);

        $response = $this->actingAs($owner)->deleteJson(route('saved-views.destroy', $view));

        $response->assertOk();
        $this->assertDatabaseMissing('saved_views', ['id' => $view->id]);
    }

    public function test_cannot_delete_or_pin_another_users_saved_view(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $otherUser = User::query()->where('username', '!=', 'robin')->firstOrFail();

        $view = SavedView::query()->create([
            'user_id' => $owner->id,
            'name' => 'Private View',
            'icon' => 'lock',
            'filters' => [],
        ]);

        $pinForbidden = $this->actingAs($otherUser)->patchJson(route('saved-views.pin', $view));
        $pinForbidden->assertForbidden();

        $deleteForbidden = $this->actingAs($otherUser)->deleteJson(route('saved-views.destroy', $view));
        $deleteForbidden->assertForbidden();
    }
}
