<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use App\Models\Area;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkRequest;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class AuthorizationLockdownTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_user_without_view_requests_permission_cannot_view_index(): void
    {
        $role = Role::query()->create(['name' => 'Restricted Viewer']);
        // Do not attach view_requests permission to role
        $user = User::query()->create([
            'name' => 'Restricted User',
            'username' => 'restricted_user',
            'email' => 'restricted@relay.studio',
            'password' => 'Secret123!',
            'role_id' => $role->id,
            'active' => true,
        ]);

        $response = $this->actingAs($user)->get(route('requests.index'));
        $response->assertForbidden();
    }

    public function test_user_without_view_requests_permission_cannot_view_show(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $ticket = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Top Secret Ticket',
            'status' => RequestStatus::New,
            'priority' => RequestPriority::Urgent,
            'requester_id' => $owner->id,
        ]);

        $role = Role::query()->create(['name' => 'No View Role']);
        $user = User::query()->create([
            'name' => 'Blind User',
            'username' => 'blind_user',
            'email' => 'blind@relay.studio',
            'password' => 'Secret123!',
            'role_id' => $role->id,
            'active' => true,
        ]);

        $response = $this->actingAs($user)->get(route('requests.show', $ticket));
        $response->assertForbidden();
    }

    public function test_user_without_change_request_status_permission_cannot_change_ticket_status(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $ticket = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Status Gated Ticket',
            'status' => RequestStatus::New,
            'priority' => RequestPriority::Normal,
            'requester_id' => $owner->id,
        ]);

        // Role with view_requests and edit_requests, but WITHOUT change_request_status
        $role = Role::query()->create(['name' => 'Editor Without Status']);
        $permissions = Permission::query()->whereIn('name', ['view_requests', 'edit_requests'])->pluck('id');
        $role->permissions()->sync($permissions);

        $user = User::query()->create([
            'name' => 'Limited Editor',
            'username' => 'limited_editor',
            'email' => 'limited@relay.studio',
            'password' => 'Secret123!',
            'role_id' => $role->id,
            'active' => true,
        ]);

        $response = $this->actingAs($user)->patchJson(route('requests.update', $ticket), [
            'status' => 'doing',
        ]);

        $response->assertForbidden();
        $ticket->refresh();
        $this->assertEquals(RequestStatus::New, $ticket->status);
    }

    public function test_user_with_change_request_status_permission_can_change_ticket_status(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $ticket = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Status Allowed Ticket',
            'status' => RequestStatus::New,
            'priority' => RequestPriority::Normal,
            'requester_id' => $owner->id,
        ]);

        $developer = User::query()->where('username', 'hussien')->firstOrFail();

        $response = $this->actingAs($developer)->patchJson(route('requests.update', $ticket), [
            'status' => 'doing',
        ]);

        $response->assertOk();
        $ticket->refresh();
        $this->assertEquals(RequestStatus::Doing, $ticket->status);
    }

    public function test_inactive_user_is_forbidden_even_with_permissions(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $ticket = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Access Check Ticket',
            'status' => RequestStatus::New,
            'priority' => RequestPriority::Normal,
            'requester_id' => $owner->id,
        ]);

        $ownerRole = Role::query()->where('name', 'Owner')->firstOrFail();
        $inactiveUser = User::query()->create([
            'name' => 'Deactivated User',
            'username' => 'deactivated_user',
            'email' => 'deactivated@relay.studio',
            'password' => 'Secret123!',
            'role_id' => $ownerRole->id,
            'active' => false,
        ]);

        $policy = new \App\Policies\WorkRequestPolicy();
        $this->assertFalse($policy->viewAny($inactiveUser));
        $this->assertFalse($policy->view($inactiveUser, $ticket));
        $this->assertFalse($policy->changeStatus($inactiveUser, $ticket));
    }
}
