<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Area;
use App\Models\Cycle;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\Workspace;
use App\Services\CycleService;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

final class EdgeCasesAndRaceConditionsTest extends TestCase
{
    use DatabaseTransactions;

    private User $owner;
    private Area $area;
    private Workspace $workspaceA;
    private Workspace $workspaceB;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        $this->owner = User::query()->where('username', 'robin')->firstOrFail();
        $this->area = Area::query()->firstOrFail();

        $this->workspaceA = Workspace::query()->create([
            'name' => 'Workspace Alpha',
            'slug' => 'workspace-alpha',
            'owner_id' => $this->owner->id,
        ]);
        $this->workspaceA->users()->attach($this->owner->id, ['role_id' => $this->owner->role_id]);

        $this->workspaceB = Workspace::query()->create([
            'name' => 'Workspace Beta',
            'slug' => 'workspace-beta',
            'owner_id' => $this->owner->id,
        ]);
        $this->workspaceB->users()->attach($this->owner->id, ['role_id' => $this->owner->role_id]);
    }

    public function test_cannot_create_circular_blocking_dependencies(): void
    {
        $ticketA = WorkRequest::query()->create([
            'workspace_id' => $this->workspaceA->id,
            'area_id' => $this->area->id,
            'title' => 'Alpha Task A',
            'requester_id' => $this->owner->id,
            'status' => 'doing',
        ]);

        $ticketB = WorkRequest::query()->create([
            'workspace_id' => $this->workspaceA->id,
            'area_id' => $this->area->id,
            'title' => 'Alpha Task B',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        // Ticket A blocks Ticket B (Ticket B is blocked by Ticket A)
        $resp1 = $this->actingAs($this->owner)
            ->postJson(route('requests.relations.store', $ticketB), [
                'related_id' => $ticketA->id,
                'type' => 'blocks',
            ]);
        $resp1->assertOk();

        // Attempt reverse blocking: Ticket B blocks Ticket A (creates a deadlock)
        $resp2 = $this->actingAs($this->owner)
            ->postJson(route('requests.relations.store', $ticketA), [
                'related_id' => $ticketB->id,
                'type' => 'blocks',
            ]);

        $resp2->assertStatus(422);
        $this->assertStringContainsString('Circular dependency detected', $resp2->json('message'));
    }

    public function test_cannot_link_dependencies_across_different_workspaces(): void
    {
        $ticketA = WorkRequest::query()->create([
            'workspace_id' => $this->workspaceA->id,
            'area_id' => $this->area->id,
            'title' => 'Workspace Alpha Ticket',
            'requester_id' => $this->owner->id,
            'status' => 'doing',
        ]);

        $ticketB = WorkRequest::query()->create([
            'workspace_id' => $this->workspaceB->id,
            'area_id' => $this->area->id,
            'title' => 'Workspace Beta Ticket',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->owner)
            ->postJson(route('requests.relations.store', $ticketA), [
                'related_id' => $ticketB->id,
                'type' => 'blocks',
            ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('different workspaces', $response->json('message'));
    }

    public function test_subtask_nesting_is_capped_at_single_level_depth(): void
    {
        $parent = WorkRequest::query()->create([
            'workspace_id' => $this->workspaceA->id,
            'area_id' => $this->area->id,
            'title' => 'Epic / Parent Ticket',
            'requester_id' => $this->owner->id,
            'status' => 'doing',
        ]);

        // Create level-1 subtask
        $level1Resp = $this->actingAs($this->owner)
            ->postJson(route('requests.subtasks.store', $parent), [
                'title' => 'Level 1 Subtask',
            ]);
        $level1Resp->assertStatus(201);
        $level1Id = $level1Resp->json('subtask.id');
        $level1Ticket = WorkRequest::query()->findOrFail($level1Id);

        // Attempt creating a subtask under the subtask (level 2)
        $level2Resp = $this->actingAs($this->owner)
            ->postJson(route('requests.subtasks.store', $level1Ticket), [
                'title' => 'Illegal Level 2 Subtask',
            ]);

        $level2Resp->assertStatus(422);
    }

    public function test_global_search_is_strictly_scoped_to_active_workspace(): void
    {
        $ticketA = WorkRequest::query()->create([
            'workspace_id' => $this->workspaceA->id,
            'area_id' => $this->area->id,
            'title' => 'UniqueSecretQueryAlpha',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        $ticketB = WorkRequest::query()->create([
            'workspace_id' => $this->workspaceB->id,
            'area_id' => $this->area->id,
            'title' => 'UniqueSecretQueryBeta',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        // Search with Workspace A active in session
        $response = $this->actingAs($this->owner)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->getJson('/api/search?q=UniqueSecretQuery');

        $response->assertOk();
        $results = $response->json('requests');
        $ids = array_column($results, 'id');

        $this->assertContains($ticketA->id, $ids);
        $this->assertNotContains($ticketB->id, $ids);
    }

    public function test_export_is_strictly_scoped_to_active_workspace(): void
    {
        $ticketA = WorkRequest::query()->create([
            'workspace_id' => $this->workspaceA->id,
            'area_id' => $this->area->id,
            'title' => 'ExportableAlphaTicket',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        $ticketB = WorkRequest::query()->create([
            'workspace_id' => $this->workspaceB->id,
            'area_id' => $this->area->id,
            'title' => 'ExportableBetaTicket',
            'requester_id' => $this->owner->id,
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->owner)
            ->withSession(['active_workspace_id' => $this->workspaceA->id])
            ->get('/requests/export?format=json');

        $response->assertOk();
        $content = $response->streamedContent();
        $this->assertStringContainsString('ExportableAlphaTicket', $content);
        $this->assertStringNotContainsString('ExportableBetaTicket', $content);
    }

    public function test_inbound_email_rejects_inactive_or_outsider_users(): void
    {
        $ticket = WorkRequest::query()->create([
            'workspace_id' => $this->workspaceA->id,
            'area_id' => $this->area->id,
            'title' => 'Ticket with Inbound Gate',
            'requester_id' => $this->owner->id,
            'status' => 'doing',
        ]);

        $inactiveUser = User::query()->create([
            'name' => 'Inactive User',
            'username' => 'inactive_user',
            'email' => 'inactive@example.com',
            'password' => bcrypt('password'),
            'role_id' => $this->owner->role_id,
            'active' => false,
        ]);
        $this->workspaceA->users()->attach($inactiveUser->id, ['role_id' => $inactiveUser->role_id]);

        $outsiderUser = User::query()->create([
            'name' => 'Outsider User',
            'username' => 'outsider_user',
            'email' => 'outsider@example.com',
            'password' => bcrypt('password'),
            'role_id' => $this->owner->role_id,
            'active' => true,
        ]);
        // outsider is NOT attached to workspaceA

        // Inactive user attempt
        $inactivePayload = [
            'From' => 'inactive@example.com',
            'To' => "reply+req-{$ticket->id}@inbound.relay.studio",
            'Subject' => "Re: Updates",
            'StrippedTextReply' => 'I am disabled but trying to comment.',
        ];
        $resp1 = $this->postJson(route('api.webhooks.inbound-email'), $inactivePayload);
        $resp1->assertStatus(403);
        $this->assertStringContainsString('inactive', $resp1->json('error'));

        // Outsider user attempt
        $outsiderPayload = [
            'From' => 'outsider@example.com',
            'To' => "reply+req-{$ticket->id}@inbound.relay.studio",
            'Subject' => "Re: Updates",
            'StrippedTextReply' => 'I belong to no workspace.',
        ];
        $resp2 = $this->postJson(route('api.webhooks.inbound-email'), $outsiderPayload);
        $resp2->assertStatus(403);
        $this->assertStringContainsString('does not belong to this workspace', $resp2->json('error'));
    }

    public function test_cycle_rollover_is_idempotent_under_concurrency(): void
    {
        $cycle = Cycle::query()->create([
            'workspace_id' => $this->workspaceA->id,
            'number' => 88,
            'name' => 'Sprint 88',
            'start_date' => now()->subDays(14)->toDateString(),
            'end_date' => now()->subDay()->toDateString(),
            'is_active' => true,
        ]);

        $service = app(CycleService::class);

        // First rollover call
        $next1 = $service->rollover($cycle);
        $this->assertNotNull($next1);
        $this->assertSame(89, $next1->number);

        // Immediate subsequent call on the same cycle (e.g. concurrent race)
        $cycle->refresh();
        $next2 = $service->rollover($cycle);

        $this->assertSame($next1->id, $next2->id);
        $this->assertSame(1, Cycle::query()->where('workspace_id', $this->workspaceA->id)->where('number', 89)->count());
    }
}
