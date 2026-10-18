<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\WorkRequest;
use App\Services\DiscordNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class SendDiscordNotification implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    public int $tries = 3;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public readonly int $workRequestId,
        public readonly array $payload = [],
    ) {}

    public function handle(): void
    {
        $workRequest = WorkRequest::query()->find($this->workRequestId);
        if ($workRequest === null) {
            return;
        }

        DiscordNotificationService::send($workRequest, $this->payload);
    }
}
