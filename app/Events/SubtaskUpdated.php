<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\WorkRequest;
use App\Services\WorkRequestPresenter;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class SubtaskUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public WorkRequest $parentRequest,
        public WorkRequest $subtask,
        public string $action, // 'created', 'toggled', 'deleted'
        public ?int $actorId = null,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('workspace.'.$this->parentRequest->workspace_id),
            new PrivateChannel('request.'.$this->parentRequest->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'SubtaskUpdated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'parent_id' => $this->parentRequest->id,
            'subtask_id' => $this->subtask->id,
            'action' => $this->action,
            'actor_id' => $this->actorId,
            'subtask' => (new WorkRequestPresenter)->card($this->subtask),
            'parent_request' => (new WorkRequestPresenter)->detail($this->parentRequest->fresh(['subtasks.assignee'])),
        ];
    }
}
