<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Cycle;
use App\Models\WorkRequest;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

final class CycleService
{
    /**
     * Compute burndown velocity data: ideal line vs actual completed points per calendar day.
     *
     * @return array<string, mixed>
     */
    public function getBurndown(Cycle $cycle): array
    {
        $requests = $cycle->requests()
            ->with(['activities' => fn ($q) => $q->whereIn('type', ['approval', 'status_changed'])->latest('id')])
            ->get();

        $hasEstimates = $requests->whereNotNull('story_points')->isNotEmpty();
        $getWeight = function (WorkRequest $r) use ($hasEstimates): int {
            if ($r->story_points !== null) {
                return max(0, (int) $r->story_points);
            }
            return $hasEstimates ? 1 : 1;
        };

        $totalPoints = $requests->sum($getWeight);
        $totalTickets = $requests->count();
        $completedRequests = $requests->filter(fn ($r) => ($r->status?->value ?? (string) $r->getRawOriginal('status')) === 'done');
        $completedPoints = $completedRequests->sum($getWeight);
        $completedTickets = $completedRequests->count();
        $rolledOverTickets = $requests->whereNotNull('rolled_over_from_cycle_id')->count();

        $startDate = Carbon::parse($cycle->start_date)->startOfDay();
        $endDate = Carbon::parse($cycle->end_date)->startOfDay();
        if ($endDate->lessThan($startDate)) {
            $endDate = $startDate->copy()->addDays(13);
        }

        $period = CarbonPeriod::create($startDate, $endDate);
        $totalDays = count($period);
        $today = now()->startOfDay();

        // Map each completed ticket to its completion date
        $completedDates = [];
        foreach ($completedRequests as $request) {
            $completionActivity = $request->activities->first(function ($activity) {
                $meta = is_array($activity->metadata) ? $activity->metadata : [];
                return ($meta['to'] ?? null) === 'done' || $activity->type === 'approval';
            });

            $dateKey = $completionActivity
                ? Carbon::parse($completionActivity->created_at)->toDateString()
                : ($request->updated_at ? Carbon::parse($request->updated_at)->toDateString() : $today->toDateString());

            $completedDates[] = [
                'date' => $dateKey,
                'weight' => $getWeight($request),
            ];
        }

        $idealSlope = $totalDays > 1 ? (float) $totalPoints / (float) ($totalDays - 1) : (float) $totalPoints;
        $days = [];
        $dayIndex = 0;

        foreach ($period as $date) {
            $dateString = $date->toDateString();
            $isFuture = $date->greaterThan($today);
            $isToday = $date->equalTo($today);

            // Ideal burndown
            $idealRemaining = max(0, round($totalPoints - ($dayIndex * $idealSlope), 1));

            // Actual remaining up to this date
            if ($isFuture) {
                $actualRemaining = null;
            } else {
                $pointsBurnedByDate = 0;
                foreach ($completedDates as $comp) {
                    if (strcmp($comp['date'], $dateString) <= 0) {
                        $pointsBurnedByDate += $comp['weight'];
                    }
                }
                $actualRemaining = max(0, $totalPoints - $pointsBurnedByDate);
            }

            $days[] = [
                'day' => $dayIndex + 1,
                'date' => $dateString,
                'label' => $date->format('M j'),
                'ideal' => $idealRemaining,
                'actual' => $actualRemaining,
                'is_today' => $isToday,
                'is_future' => $isFuture,
            ];

            $dayIndex++;
        }

        $daysElapsed = max(1, min($totalDays, (int) $startDate->diffInDays($today) + 1));
        $velocity = $daysElapsed > 0 ? round($completedPoints / $daysElapsed, 2) : 0;

        return [
            'cycle' => [
                'id' => $cycle->id,
                'number' => $cycle->number,
                'name' => $cycle->name,
                'start_date' => $cycle->start_date?->format('Y-m-d'),
                'end_date' => $cycle->end_date?->format('Y-m-d'),
                'is_active' => (bool) $cycle->is_active,
                'completed_at' => $cycle->completed_at?->toIso8601String(),
            ],
            'metrics' => [
                'total_points' => $totalPoints,
                'completed_points' => $completedPoints,
                'remaining_points' => max(0, $totalPoints - $completedPoints),
                'total_tickets' => $totalTickets,
                'completed_tickets' => $completedTickets,
                'rolled_over_tickets' => $rolledOverTickets,
                'completion_percentage' => $totalPoints > 0 ? (int) round(($completedPoints / $totalPoints) * 100) : 0,
                'velocity_points_per_day' => $velocity,
            ],
            'days' => $days,
        ];
    }

    /**
     * Closes the given cycle, creates the next 2-week cycle, and rolls over unfinished tickets.
     */
    public function rollover(Cycle $cycle): Cycle
    {
        return DB::transaction(function () use ($cycle): Cycle {
            // 1. Mark existing cycle completed
            $cycle->update([
                'is_active' => false,
                'completed_at' => now(),
            ]);

            // 2. Compute next 2-week date range
            $nextNumber = $cycle->number + 1;
            $newStartDate = $cycle->end_date ? Carbon::parse($cycle->end_date)->addDay()->startOfDay() : now()->startOfDay();
            $newEndDate = $newStartDate->copy()->addDays(13)->startOfDay();

            // 3. Create next cycle
            $nextCycle = Cycle::query()->create([
                'workspace_id' => $cycle->workspace_id,
                'number' => $nextNumber,
                'name' => "Cycle {$nextNumber}",
                'start_date' => $newStartDate->toDateString(),
                'end_date' => $newEndDate->toDateString(),
                'is_active' => true,
            ]);

            // 4. Rollover unfinished tickets
            $unfinishedTickets = WorkRequest::query()
                ->where('cycle_id', $cycle->id)
                ->where('status', '!=', 'done')
                ->get();

            foreach ($unfinishedTickets as $ticket) {
                $ticket->update([
                    'cycle_id' => $nextCycle->id,
                    'rolled_over_from_cycle_id' => $cycle->id,
                ]);
            }

            return $nextCycle;
        });
    }
}
