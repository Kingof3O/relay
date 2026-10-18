<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Cycle;
use App\Services\CycleService;
use Carbon\Carbon;
use Illuminate\Console\Command;

final class RolloverCycleCommand extends Command
{
    protected $signature = 'relay:cycle-rollover {--workspace= : Specific workspace ID to rollover} {--force : Force rollover even if cycle end date has not elapsed}';

    protected $description = 'Closes expired active cycles, creates the next cycle, and rolls over unfinished tickets';

    public function handle(CycleService $cycleService): int
    {
        $workspaceId = $this->option('workspace');
        $force = (bool) $this->option('force');

        $query = Cycle::query()->active();
        if ($workspaceId) {
            $query->where('workspace_id', (int) $workspaceId);
        }

        $activeCycles = $query->get();

        if ($activeCycles->isEmpty()) {
            $this->info('No active cycles found.');
            return self::SUCCESS;
        }

        $today = now()->toDateString();

        foreach ($activeCycles as $cycle) {
            $endDate = $cycle->end_date ? Carbon::parse($cycle->end_date)->toDateString() : $today;
            $isExpired = strcmp($endDate, $today) <= 0;

            if ($isExpired || $force) {
                $unfinishedCount = $cycle->requests()->where('status', '!=', 'done')->count();
                $nextCycle = $cycleService->rollover($cycle);

                $this->info("Cycle #{$cycle->number} closed. Cycle #{$nextCycle->number} created. Rolled over {$unfinishedCount} unfinished ticket(s).");
            } else {
                $this->line("Cycle #{$cycle->number} ('{$cycle->name}') is active until {$endDate}. Skipping (use --force to rollover immediately).");
            }
        }

        return self::SUCCESS;
    }
}
