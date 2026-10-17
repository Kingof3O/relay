<?php

namespace Tests\Feature;

use App\Mail\WorkRequestNotificationMail;
use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

final class CommentMentionsAndCloneTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_comment_containing_mention_dispatches_notification_and_email(): void
    {
        Mail::fake();

        $author = User::query()->where('username', 'robin')->firstOrFail();
        $mentioned = User::query()->where('username', 'hussien')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $workRequest = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Optimize database queries',
            'description' => 'We need faster search.',
            'status' => 'new',
            'priority' => 'normal',
            'requester_id' => $author->id,
            'assignee_id' => null,
        ]);

        $response = $this->actingAs($author)->postJson(route('requests.comments.store', $workRequest->id), [
            'body' => "Hey @{$mentioned->username}, please review this request!",
        ]);

        $response->assertOk();

        // Check database notification
        $notification = $mentioned->notifications()
            ->where('data->event', 'mention')
            ->first();

        $this->assertNotNull($notification);
        $this->assertEquals("{$author->name} mentioned you in a comment on #REQ-{$workRequest->id}.", $notification->data['message']);

        // Check email queued / sent
        Mail::assertQueued(WorkRequestNotificationMail::class, function (WorkRequestNotificationMail $mail) use ($mentioned, $workRequest): bool {
            return $mail->hasTo($mentioned->email)
                && $mail->workRequest->id === $workRequest->id
                && $mail->payload['event'] === 'mention';
        });
    }

    public function test_cloning_request_creates_duplicate_with_copy_prefix_and_redirects(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $assignee = User::query()->where('username', 'hussien')->firstOrFail();
        $area = Area::query()->firstOrFail();

        $original = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Setup CI/CD Pipeline',
            'description' => 'GitHub Actions deployment workflow.',
            'status' => 'doing',
            'priority' => 'urgent',
            'requester_id' => $user->id,
            'assignee_id' => $assignee->id,
        ]);

        $response = $this->actingAs($user)->post(route('requests.clone', $original->id));

        $cloned = WorkRequest::query()->where('title', '[Copy] Setup CI/CD Pipeline')->first();
        $this->assertNotNull($cloned);
        $this->assertEquals('new', $cloned->status?->value ?? (string) $cloned->status);
        $this->assertEquals($original->description, $cloned->description);
        $this->assertEquals($original->area_id, $cloned->area_id);
        $this->assertEquals('urgent', $cloned->priority?->value ?? (string) $cloned->priority);
        $this->assertEquals($assignee->id, $cloned->assignee_id);

        // Check logged activity
        $activity = $cloned->activities()->where('body', "Duplicated from #REQ-{$original->id}")->first();
        $this->assertNotNull($activity);

        $response->assertRedirect(route('requests.show', $cloned->id));
    }
}
