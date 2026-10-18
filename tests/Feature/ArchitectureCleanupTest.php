<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\RoleName;
use App\Jobs\SendRequestEmail;
use App\Models\Area;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkRequest;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

final class ArchitectureCleanupTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_role_name_enum_defines_core_roles_and_is_used(): void
    {
        $this->assertSame('Owner', RoleName::Owner->value);
        $this->assertSame('Developer', RoleName::Developer->value);
        $this->assertSame('Designer', RoleName::Designer->value);
        $this->assertSame('Stakeholder', RoleName::Stakeholder->value);

        // Verify WorkRequestPolicy respects RoleName::Designer
        $designerUser = User::query()->where('username', 'designer-1')->firstOrFail();
        $otherUser = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $requestNotOwned = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Robin ticket',
            'description' => 'Test',
            'status' => 'new',
            'priority' => 'normal',
            'requester_id' => $otherUser->id,
        ]);

        $policy = app(\App\Policies\WorkRequestPolicy::class);
        $this->assertFalse($policy->update($designerUser, $requestNotOwned), 'Designer should not update request not created by them');

        $requestOwned = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Designer ticket',
            'description' => 'Test',
            'status' => 'new',
            'priority' => 'normal',
            'requester_id' => $designerUser->id,
        ]);

        $this->assertTrue($policy->update($designerUser, $requestOwned), 'Designer should be allowed to update request created by them');
    }

    public function test_permission_manage_workspace_middleware_protects_settings_routes(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $developer = User::query()->where('username', 'hussien')->firstOrFail();
        $designer = User::query()->where('username', 'designer-1')->firstOrFail();

        // Owner can access settings
        $this->actingAs($owner)->get(route('settings.index'))->assertOk();

        // Developer has manage_workspace permission and can access settings
        $this->actingAs($developer)->get(route('settings.index'))->assertOk();

        // Designer does NOT have manage_workspace permission -> 403 Forbidden
        $this->actingAs($designer)->get(route('settings.index'))->assertForbidden();

        // Designer cannot POST to /settings/projects
        $this->actingAs($designer)->postJson(route('settings.projects.store'), [
            'name' => 'Unauthorized Project',
        ])->assertForbidden();

        // Designer cannot POST to /settings/team
        $this->actingAs($designer)->postJson(route('settings.team.store'), [
            'name' => 'Unauthorized Member',
        ])->assertForbidden();
    }

    public function test_mentions_parsing_is_bounded_and_restricted_to_active_usernames(): void
    {
        Queue::fake();

        $author = User::query()->where('username', 'robin')->firstOrFail();
        $activeUser = User::query()->where('username', 'hussien')->firstOrFail();
        $designerRole = Role::query()->where('name', RoleName::Designer->value)->firstOrFail();

        // Create an inactive user
        $inactiveUser = User::query()->create([
            'name' => 'Inactive Guy',
            'username' => 'inactive_user',
            'email' => 'inactive@relay.studio',
            'password' => bcrypt('secret'),
            'role_id' => $designerRole->id,
            'active' => false,
        ]);

        $area = Area::query()->firstOrFail();
        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Mention Bounds Test',
            'description' => 'Test',
            'status' => 'new',
            'priority' => 'normal',
            'requester_id' => $author->id,
        ]);

        // Mention active user, inactive user, non-existent user, and active user's name (not username)
        $body = "Hello @{$activeUser->username}, @{$inactiveUser->username}, @doesnotexist, and @Hussien (Lead Dev)";
        $response = $this->actingAs($author)->postJson(route('requests.comments.store', $request->id), [
            'body' => $body,
        ]);

        $response->assertOk();

        // Only activeUser should receive a notification
        $this->assertNotNull($activeUser->notifications()->where('data->event', 'mention')->first());
        $this->assertNull($inactiveUser->notifications()->where('data->event', 'mention')->first());

        // Queue check: only activeUser receives email
        Queue::assertPushed(SendRequestEmail::class, 1);
        Queue::assertPushed(SendRequestEmail::class, fn (SendRequestEmail $job) => $job->userId === $activeUser->id);

        // Test bounding to 10 mentions maximum
        Queue::fake();

        // Create 12 active users
        $mentionedIds = [];
        $mentionBody = 'Bulk test: ';
        for ($i = 1; $i <= 12; $i++) {
            $u = User::query()->create([
                'name' => "Mention User {$i}",
                'username' => "mention_target_{$i}",
                'email' => "target{$i}@relay.studio",
                'password' => bcrypt('secret'),
                'role_id' => $designerRole->id,
                'active' => true,
            ]);
            $mentionedIds[] = $u->id;
            $mentionBody .= "@{$u->username} ";
        }

        $res = $this->actingAs($author)->postJson(route('requests.comments.store', $request->id), [
            'body' => $mentionBody,
        ]);
        $res->assertOk();

        // Maximum of 10 emails dispatched
        Queue::assertPushed(SendRequestEmail::class, function () use (&$count) {
            $count++;
            return true;
        });
        $this->assertLessThanOrEqual(10, Queue::pushed(SendRequestEmail::class)->count());
    }

    public function test_dead_skeleton_code_and_duplicate_presenters_are_purged(): void
    {
        $deadClasses = [
            'App\Models\Idea',
            'App\Models\Task',
            'App\Models\FollowUp',
            'App\Models\Project',
            'App\Models\StoredFile',
            'App\Enums\IdeaStatus',
            'App\Enums\ProjectStatus',
            'App\Policies\IdeaPolicy',
            'App\Policies\TaskPolicy',
            'App\Policies\ProjectPolicy',
            'App\Policies\RolePolicy',
            'App\Presenters\WorkRequestPresenter',
            'Database\Seeders\BigDataSeeder',
            'Database\Factories\IdeaFactory',
            'Database\Factories\FollowUpFactory',
        ];

        foreach ($deadClasses as $class) {
            $this->assertFalse(class_exists($class), "Class {$class} was expected to be deleted, but still exists.");
        }

        $deadComponentFiles = [
            resource_path('js/Features/Dashboard/components/RecentAssignedIdeasCard.tsx'),
            resource_path('js/Features/Dashboard/components/PendingReplyIdeasCard.tsx'),
            resource_path('js/Features/Dashboard/components/OpenTasksCard.tsx'),
            resource_path('js/Features/Dashboard/components/StatusCountsCard.tsx'),
            resource_path('js/Components/Dashboard/RecentAssignedIdeasCard.tsx'),
            resource_path('js/Components/Dashboard/PendingReplyIdeasCard.tsx'),
            resource_path('js/Components/Dashboard/OpenTasksCard.tsx'),
            resource_path('js/Components/Dashboard/StatusCountsCard.tsx'),
            resource_path('js/Components/Notifications/NotificationPopover.tsx'),
        ];

        foreach ($deadComponentFiles as $filePath) {
            $this->assertFileDoesNotExist($filePath, "Component file {$filePath} should have been deleted.");
        }
    }
}
