<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Events\WorkRequestCommented;
use App\Events\WorkRequestMoved;
use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\Workspace;
use App\Services\WorkRequestService;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

final class ReverbRealtimeBroadcastTest extends TestCase
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

    public function test_work_request_moved_broadcasts_on_private_workspace_channel(): void
    {
        $workRequest = WorkRequest::query()->create([
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'title' => 'Broadcast moved card',
            'status' => 'new',
            'requester_id' => $this->owner->id,
        ]);

        $event = new WorkRequestMoved($workRequest, $this->owner->id, 'new', 'doing');

        $channels = $event->broadcastOn();
        $this->assertCount(1, $channels);
        $this->assertInstanceOf(PrivateChannel::class, $channels[0]);
        $this->assertSame('private-workspace.'.$this->workspace->id, $channels[0]->name);

        $payload = $event->broadcastWith();
        $this->assertSame($workRequest->id, $payload['request_id']);
        $this->assertSame($this->owner->id, $payload['actor_id']);
        $this->assertSame('new', $payload['from_status']);
        $this->assertSame('doing', $payload['to_status']);
        $this->assertArrayHasKey('request', $payload);
    }

    public function test_work_request_commented_broadcasts_on_private_workspace_channel(): void
    {
        $workRequest = WorkRequest::query()->create([
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'title' => 'Broadcast comment card',
            'requester_id' => $this->owner->id,
        ]);

        $service = app(WorkRequestService::class);
        $activity = $service->recordActivity($workRequest, $this->owner, 'comment', 'Live commentary');

        $event = new WorkRequestCommented($workRequest, $activity, $this->owner->id);

        $channels = $event->broadcastOn();
        $this->assertCount(2, $channels);
        $this->assertInstanceOf(PrivateChannel::class, $channels[0]);
        $this->assertSame('private-workspace.'.$this->workspace->id, $channels[0]->name);
        $this->assertInstanceOf(PrivateChannel::class, $channels[1]);
        $this->assertSame('private-request.'.$workRequest->id, $channels[1]->name);

        $payload = $event->broadcastWith();
        $this->assertSame($workRequest->id, $payload['request_id']);
        $this->assertSame($activity->id, $payload['activity_id']);
        $this->assertSame('Live commentary', $payload['body']);
        $this->assertSame($this->owner->id, $payload['actor_id']);
        $this->assertArrayHasKey('request', $payload);
    }

    public function test_workspace_channel_authorization_allows_member_and_rejects_outsider(): void
    {
        $outsider = User::factory()->create();

        $channels = Broadcast::driver()->getChannels();
        $workspaceChannelCallback = $channels['workspace.{id}'];

        $this->assertTrue((bool) $workspaceChannelCallback($this->owner, $this->workspace->id));
        $this->assertFalse((bool) $workspaceChannelCallback($outsider, $this->workspace->id));
    }

    public function test_work_request_service_dispatches_events(): void
    {
        Event::fake([WorkRequestMoved::class, WorkRequestCommented::class]);

        $workRequest = WorkRequest::query()->create([
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'title' => 'Service event dispatch',
            'status' => 'new',
            'requester_id' => $this->owner->id,
        ]);

        $service = app(WorkRequestService::class);

        // Update dispatches WorkRequestMoved
        $service->update($workRequest, $this->owner, ['status' => 'doing']);
        Event::assertDispatched(WorkRequestMoved::class, function ($event) use ($workRequest) {
            return $event->request->id === $workRequest->id && $event->toStatus === 'doing';
        });

        // AddComment dispatches WorkRequestCommented
        $service->addComment($workRequest, $this->owner, 'Great progress!');
        Event::assertDispatched(WorkRequestCommented::class, function ($event) use ($workRequest) {
            return $event->request->id === $workRequest->id && $event->activity->body === 'Great progress!';
        });
    }

    public function test_http_mutations_dispatch_realtime_broadcast_events(): void
    {
        Event::fake([WorkRequestMoved::class, WorkRequestCommented::class]);

        $workRequest = WorkRequest::query()->create([
            'workspace_id' => $this->workspace->id,
            'area_id' => $this->area->id,
            'title' => 'HTTP trigger test',
            'status' => 'new',
            'requester_id' => $this->owner->id,
        ]);

        $response = $this->actingAs($this->owner)->patchJson(route('requests.update', $workRequest), [
            'status' => 'review',
        ]);
        $response->assertOk();

        Event::assertDispatched(WorkRequestMoved::class, function ($event) use ($workRequest) {
            return $event->request->id === $workRequest->id && $event->toStatus === 'review';
        });

        $commentResponse = $this->actingAs($this->owner)->postJson(route('requests.comments.store', $workRequest), [
            'body' => 'HTTP comment test',
        ]);
        $commentResponse->assertOk();

        Event::assertDispatched(WorkRequestCommented::class, function ($event) use ($workRequest) {
            return $event->request->id === $workRequest->id && $event->activity->body === 'HTTP comment test';
        });
    }
}
