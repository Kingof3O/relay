<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\SendRequestEmail;
use App\Mail\WorkRequestNotificationMail;
use App\Models\Area;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkspaceAudit;
use App\Models\WorkRequest;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

final class WorkspaceAuditTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_changing_team_role_logs_workspace_audit_record(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $targetUser = User::query()->where('username', 'hussien')->firstOrFail();
        $designerRole = Role::query()->where('name', 'Designer')->firstOrFail();

        $oldRoleId = $targetUser->role_id;

        $response = $this->actingAs($owner)
            ->patchJson(route('settings.team.update', $targetUser), [
                'role_id' => $designerRole->id,
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('workspace_audits', [
            'user_id' => $owner->id,
            'event' => 'member.role_updated',
            'auditable_type' => User::class,
            'auditable_id' => $targetUser->id,
        ]);

        $audit = WorkspaceAudit::query()
            ->where('event', 'member.role_updated')
            ->where('auditable_id', $targetUser->id)
            ->firstOrFail();

        $this->assertEquals($oldRoleId, $audit->old_values['role_id']);
        $this->assertEquals($designerRole->id, $audit->new_values['role_id']);
    }

    public function test_user_notification_preferences_toggle_and_filtering_in_email_dispatch(): void
    {
        Mail::fake();

        $user = User::query()->where('username', 'hussien')->firstOrFail();
        $area = Area::query()->firstOrFail();

        // 1. Update notification preferences via Profile PATCH
        $response = $this->actingAs($user)
            ->patch(route('profile.update'), [
                'notification_preferences' => [
                    'email_on_assignment' => false,
                    'email_on_status_change' => true,
                    'email_on_comment' => false,
                ],
            ]);

        $response->assertSessionHasNoErrors();
        $user->refresh();

        $this->assertFalse($user->notification_preferences['email_on_assignment']);
        $this->assertTrue($user->notification_preferences['email_on_status_change']);
        $this->assertFalse($user->notification_preferences['email_on_comment']);

        // Create a test request
        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Test Notification Filtering',
            'description' => 'Test body',
            'priority' => 'normal',
            'requester_id' => $user->id,
            'assignee_id' => $user->id,
        ]);

        // 2. Dispatch SendRequestEmail for assignment (which is disabled)
        $assignmentJob = new SendRequestEmail($user->id, [
            'event' => 'assigned',
            'request_id' => $request->id,
            'message' => 'You were assigned to this request',
        ]);
        $assignmentJob->handle();

        // Email should NOT be sent because email_on_assignment is false
        Mail::assertNothingQueued();

        // 3. Dispatch SendRequestEmail for status change (which is enabled)
        $statusJob = new SendRequestEmail($user->id, [
            'event' => 'review',
            'request_id' => $request->id,
            'message' => 'Status changed to review',
        ]);
        $statusJob->handle();

        // Email SHOULD be queued/sent
        Mail::assertQueued(WorkRequestNotificationMail::class, function (WorkRequestNotificationMail $mail) use ($user, $request): bool {
            return $mail->hasTo($user->email)
                && $mail->workRequest->id === $request->id;
        });
    }
}
