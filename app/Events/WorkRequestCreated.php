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

final class WorkRequestCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public WorkRequest $request,
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
            new PrivateChannel('workspace.'.$this->request->workspace_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'WorkRequestCreated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'request_id' => $this->request->id,
            'actor_id' => $this->actorId,
            'request' => (new WorkRequestPresenter)->card($this->request),
        ];
    }
}
