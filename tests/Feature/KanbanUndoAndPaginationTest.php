<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\WorkspaceAudit;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class KanbanUndoAndPaginationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Area $area;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        $this->user = User::query()->where('username', 'robin')->firstOrFail();
        $this->area = Area::query()->firstOrFail();
    }

    public function test_server_side_status_rollback_on_kanban_undo(): void
    {
        $ticket = WorkRequest::query()->create([
            'title' => 'Feature Ticket for Undo',
            'area_id' => $this->area->id,
            'requester_id' => $this->user->id,
            'status' => 'ready',
            'priority' => 'normal',
        ]);

        $this->assertEquals('ready', $ticket->status->value);

        // 1. User moves card to 'doing'
        $moveResponse = $this->actingAs($this->user)
            ->patchJson(route('requests.update', $ticket), [
                'status' => 'doing',
            ]);

        $moveResponse->assertOk()
            ->assertJsonPath('request.status', 'doing');

        $ticket->refresh();
        $this->assertEquals('doing', $ticket->status->value);

        // 2. User clicks "Undo" toast action, rolling status back to 'ready'
        $undoResponse = $this->actingAs($this->user)
            ->patchJson(route('requests.update', $ticket), [
                'status' => 'ready',
            ]);

        $undoResponse->assertOk()
            ->assertJsonPath('request.status', 'ready');

        $ticket->refresh();
        $this->assertEquals('ready', $ticket->status->value);

        // Verify status change activities were logged
        $this->assertDatabaseHas('request_activities', [
            'request_id' => $ticket->id,
            'type' => 'status_changed',
        ]);
    }

    public function test_requests_index_supports_windowed_query_capping(): void
    {
        for ($i = 1; $i <= 20; $i++) {
            WorkRequest::query()->create([
                'title' => "Batch Ticket #{$i}",
                'area_id' => $this->area->id,
                'requester_id' => $this->user->id,
                'status' => 'new',
                'priority' => 'normal',
            ]);
        }

        // Test windowed query capping with limit parameter
        $response = $this->actingAs($this->user)
            ->getJson(route('requests.index', ['limit' => 5]));

        $response->assertOk()
            ->assertJsonPath('count', 5)
            ->assertJsonPath('limit', 5);

        $this->assertCount(5, $response->json('requests'));
    }

    public function test_workspace_audit_log_event_filtering_and_pagination(): void
    {
        WorkspaceAudit::query()->create([
            'user_id' => $this->user->id,
            'event' => 'member.role_updated',
            'auditable_type' => User::class,
            'auditable_id' => $this->user->id,
            'new_values' => ['role' => 'Developer'],
        ]);

        WorkspaceAudit::query()->create([
            'user_id' => $this->user->id,
            'event' => 'project.created',
            'auditable_type' => Area::class,
            'auditable_id' => $this->area->id,
            'new_values' => ['name' => 'New Area'],
        ]);

        WorkspaceAudit::query()->create([
            'user_id' => $this->user->id,
            'event' => 'member.role_updated',
            'auditable_type' => User::class,
            'auditable_id' => $this->user->id,
            'new_values' => ['role' => 'Designer'],
        ]);

        // Filter by event
        $filteredRes = $this->actingAs($this->user)
            ->getJson(route('settings.index', ['audit_event' => 'member.role_updated']));

        $filteredRes->assertOk()
            ->assertJsonPath('auditMeta.total', 2)
            ->assertJsonPath('auditMeta.event_filter', 'member.role_updated');

        $this->assertCount(2, $filteredRes->json('audits'));

        // Test pagination
        $pagedRes = $this->actingAs($this->user)
            ->getJson(route('settings.index', ['audit_page' => 1, 'audit_per_page' => 2]));

        $pagedRes->assertOk()
            ->assertJsonPath('auditMeta.per_page', 2)
            ->assertJsonPath('auditMeta.current_page', 1);

        $this->assertCount(2, $pagedRes->json('audits'));
    }
}
