<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Models\Workspace;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

final class TeamMemberScopingTest extends TestCase
{
    use RefreshDatabase;

    private Workspace $workspace;

    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        $this->owner = User::query()->where('username', 'robin')->firstOrFail();
        $this->workspace = Workspace::query()->create([
            'name' => 'Acme HQ',
            'slug' => 'acme-hq',
            'owner_id' => $this->owner->id,
        ]);
        $this->workspace->users()->attach($this->owner->id, [
            'role_id' => $this->owner->role_id,
        ]);
    }

    public function test_removing_member_detaches_them_from_workspace_without_deleting_user_account(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $workspace = $owner->workspaces()->firstOrFail();

        $memberRole = Role::query()->where('name', 'Developer')->firstOrFail();
        $member = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);
        $workspace->users()->attach($member->id, ['role_id' => $memberRole->id]);

        $this->actingAs($owner)
            ->deleteJson(route('settings.team.destroy', $member))
            ->assertOk();

        // Assert detached from workspace
        $this->assertDatabaseMissing('workspace_user', [
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
        ]);

        // Assert global user record STILL exists
        $this->assertDatabaseHas('users', [
            'id' => $member->id,
        ]);
    }

    public function test_cannot_remove_user_from_workspace_they_do_not_belong_to(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $otherUser = User::factory()->create();

        $this->actingAs($owner)
            ->deleteJson(route('settings.team.destroy', $otherUser))
            ->assertStatus(404);
    }

    public function test_cannot_remove_last_remaining_owner(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();

        $this->actingAs($owner)
            ->deleteJson(route('settings.team.destroy', $owner))
            ->assertStatus(422);
    }

    public function test_cannot_demote_last_remaining_owner(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $devRole = Role::query()->where('name', 'Developer')->firstOrFail();

        $this->actingAs($owner)
            ->patchJson(route('settings.team.update', $owner), [
                'role_id' => $devRole->id,
            ])
            ->assertStatus(422);
    }

    public function test_cannot_update_member_password_via_team_update(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $workspace = $owner->workspaces()->firstOrFail();

        $memberRole = Role::query()->where('name', 'Developer')->firstOrFail();
        $member = User::factory()->create([
            'password' => Hash::make('original-password'),
        ]);
        $workspace->users()->attach($member->id, ['role_id' => $memberRole->id]);

        $this->actingAs($owner)
            ->patchJson(route('settings.team.update', $member), [
                'name' => 'Updated Name',
                'password' => 'malicious-new-password',
                'password_confirmation' => 'malicious-new-password',
            ])
            ->assertOk();

        $member->refresh();
        $this->assertSame('Updated Name', $member->name);
        $this->assertTrue(Hash::check('original-password', $member->password));
        $this->assertFalse(Hash::check('malicious-new-password', $member->password));
    }
}
