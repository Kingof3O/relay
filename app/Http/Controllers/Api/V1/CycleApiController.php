<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Cycle;
use App\Models\WorkRequest;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CycleApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $workspace = $user?->currentWorkspace() ?? $user?->workspaces()->first();

        if (! $workspace) {
            return response()->json([
                'data' => [],
            ]);
        }

        $cycles = Cycle::query()
            ->where('workspace_id', $workspace->id)
            ->orderByDesc('number')
            ->limit(20)
            ->get()
            ->map(fn (Cycle $cycle): array => $this->formatCycle($cycle));

        return response()->json([
            'data' => $cycles,
        ]);
    }

    public function current(Request $request): JsonResponse
    {
        $user = $request->user();
        $workspace = $user?->currentWorkspace() ?? $user?->workspaces()->first();

        if (! $workspace) {
            return response()->json([
                'message' => 'User does not belong to an active workspace.',
            ], 403);
        }

        $activeCycle = Cycle::query()
            ->where('workspace_id', $workspace->id)
            ->where('is_active', true)
            ->first();

        if (! $activeCycle) {
            return response()->json([
                'active_cycle' => null,
                'message' => 'No active cycle currently running in this workspace.',
            ]);
        }

        return response()->json([
            'active_cycle' => $this->formatCycle($activeCycle, true),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatCycle(Cycle $cycle, bool $includeBreakdown = false): array
    {
        $requests = WorkRequest::query()
            ->where('cycle_id', $cycle->id)
            ->whereNull('deleted_at');

        $totalPoints = (int) (clone $requests)->sum('story_points');
        $completedPoints = (int) (clone $requests)->where('status', 'done')->sum('story_points');
        $totalCount = (clone $requests)->count();
        $completedCount = (clone $requests)->where('status', 'done')->count();

        $daysRemaining = $cycle->end_date
            ? max(0, (int) CarbonImmutable::today()->diffInDays($cycle->end_date, false))
            : null;

        $data = [
            'id' => $cycle->id,
            'name' => $cycle->name,
            'number' => $cycle->number,
            'is_active' => (bool) $cycle->is_active,
            'start_date' => $cycle->start_date?->format('Y-m-d'),
            'end_date' => $cycle->end_date?->format('Y-m-d'),
            'days_remaining' => $daysRemaining,
            'total_points' => $totalPoints,
            'completed_points' => $completedPoints,
            'points_progress_percentage' => $totalPoints > 0 ? round(($completedPoints / $totalPoints) * 100, 1) : 0,
            'total_tasks' => $totalCount,
            'completed_tasks' => $completedCount,
            'completed_at' => $cycle->completed_at?->toIso8601String(),
        ];

        if ($includeBreakdown) {
            $data['status_breakdown'] = [
                'new' => (clone $requests)->where('status', 'new')->count(),
                'ready' => (clone $requests)->where('status', 'ready')->count(),
                'doing' => (clone $requests)->whereIn('status', ['doing', 'in_progress'])->count(),
                'review' => (clone $requests)->where('status', 'review')->count(),
                'done' => $completedCount,
            ];
        }

        return $data;
    }
}
