<?php

namespace App\Jobs;

use App\Enums\RequestFileProcessingStatus;
use App\Models\RequestFile;
use App\Services\RequestFileProcessingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class ProcessRequestFile implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public function __construct(public readonly int $fileId) {}

    public function handle(RequestFileProcessingService $processor): void
    {
        $file = RequestFile::query()->find($this->fileId);

        if ($file === null) {
            return;
        }

        if ($file->processing_status === RequestFileProcessingStatus::Ready) {
            return;
        }

        $processor->process($file);
    }
}
